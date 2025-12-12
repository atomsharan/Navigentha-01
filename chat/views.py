# chat/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ConversationSession, MessageLog
from chat.career_bot import chat_with_bot
from chat.utils.data_loader import load_dataset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_post(request):
    try:
        body = json.loads(request.body.decode() or "{}")
    except Exception:
        return Response({"error": "invalid json"}, status=400)

    conversation_id = body.get("conversation_id")
    msg = (body.get("message") or "").strip()

    if not all([conversation_id, msg]):
        return Response({"error": "conversation_id and message are required"}, status=400)

    # Get or create session, now associated with the user
    sess, created = ConversationSession.objects.get_or_create(
        session_id=conversation_id, 
        defaults={'user': request.user}
    )
    if not created and not sess.user:
        sess.user = request.user
        sess.save()

    # Log user message
    MessageLog.objects.create(session=sess, role="user", text=msg, created_at=timezone.now())

    # Generate reply using bot
    bot_response = chat_with_bot(msg)

    # Log bot message
    MessageLog.objects.create(session=sess, role="bot", text=bot_response["reply"], created_at=timezone.now())

    return Response({
        "reply": bot_response["reply"],
        "conversation_id": conversation_id,
        "intent": bot_response.get("career"),
        "confidence": bot_response.get("confidence"),
        "fallback": bot_response.get("fallback"),
    })

@csrf_exempt
def chat_ask(request):
    """
    POST { "session_id": "abc", "message": "I am in 12th and like coding" }
    """
    try:
        body = json.loads(request.body.decode() or "{}")
    except Exception:
        return JsonResponse({"error": "invalid json"}, status=400)

    session_id = body.get("session_id") or "anon"
    msg = (body.get("message") or "").strip()
    if not msg:
        return JsonResponse({"error": "empty message"}, status=400)

    # Get or create session (core app model)
    sess, _ = ConversationSession.objects.get_or_create(session_id=session_id)

    # Log user message (chat.models.MessageLog model)
    try:
        MessageLog.objects.create(session=sess, role="user", text=msg, created_at=timezone.now())
    except Exception:
        # If MessageLog or session relations differ, ignore logging but continue
        pass

    # Build short history context for smarter fallback
    prior = list(MessageLog.objects.filter(session=sess).order_by('created_at')[:6].values('role','text'))
    # Generate reply using bot with context
    reply = chat_with_bot(msg, history=prior)["reply"]

    # Save bot message to logs if possible
    try:
        MessageLog.objects.create(session=sess, role="bot", text=reply, created_at=timezone.now())
    except Exception:
        pass

    return JsonResponse({"type": "bot", "text": reply})

@csrf_exempt
def ask_career(request):
    # quick GET test or POST
    if request.method == "GET":
        user_message = request.GET.get("message","")
    else:
        try:
            body = json.loads(request.body.decode() or "{}")
            user_message = body.get("message","")
        except Exception:
            user_message = ""

    reply = chat_with_bot(user_message)["reply"]
    return JsonResponse({"reply": reply})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history(request):
    """
    Retrieves the chat history for the authenticated user.
    """
    user = request.user
    conversations = ConversationSession.objects.filter(user=user).prefetch_related('messagelog_set').order_by('-id')
    
    history = []
    for convo in conversations:
        messages = convo.messagelog_set.all().order_by('created_at')
        history.append({
            'conversation_id': convo.session_id,
            'stage': convo.stage,
            'last_user_message': convo.last_user_message,
            'selected_career': convo.selected_career.name if convo.selected_career else None,
            'messages': [
                {
                    'role': msg.role,
                    'text': msg.text,
                    'created_at': msg.created_at.isoformat()
                }
                for msg in messages
            ]
        })
        
    return Response(history)