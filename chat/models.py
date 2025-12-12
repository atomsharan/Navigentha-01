from django.db import models
from django.contrib.auth.models import User

class ConversationSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    stage = models.CharField(max_length=50, blank=True, null=True)
    last_user_message = models.TextField(blank=True, null=True)
    awaiting_specialty = models.BooleanField(default=False)
    selected_career = models.ForeignKey(
        "core.Career", null=True, blank=True, on_delete=models.SET_NULL
        , related_name='chat_sessions'
    )

class MessageLog(models.Model):
    session = models.ForeignKey(ConversationSession, on_delete=models.CASCADE)
    role = models.CharField(max_length=20)  # "user" or "bot"
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
