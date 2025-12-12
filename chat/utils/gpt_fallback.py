# chat/utils/gpt_fallback.py
import os
from typing import Dict, List, Optional
from django.conf import settings
from openai import OpenAI


def gpt_fallback(user_message: str, career_data: List[Dict] = None, history: Optional[List[Dict]] = None) -> Optional[Dict]:
    """Use OpenAI GPT as a powerful fallback for career guidance and general questions.
    
    Returns None if GPT is not available or fails, so callers can try another path.
    """
    api_key = getattr(settings, 'OPENAI_API_KEY', None) or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("DEBUG: No OpenAI API key found")
        return None
    
    try:
        client = OpenAI(api_key=api_key)
        
        # Build system prompt for career guidance
        sys_prompt = (
            "You are a professional career mentor and advisor. You help students and professionals "
            "with career guidance, educational advice, and general questions. Be warm, professional, and helpful.\n\n"
            "CRITICAL RULES:\n"
            "1. Ask ONLY ONE question at a time. Don't overwhelm the user.\n"
            "2. Ask MAXIMUM 3-4 questions total. After that, provide a summary and career roadmap.\n"
            "3. NEVER assume the user's education level, age, grade, or background unless they explicitly mention it.\n"
            "4. ALWAYS read the conversation history carefully and respond based on what the user has actually said.\n"
            "5. For career questions: Ask about their interests, current education level, and goals.\n"
            "6. For general questions: Answer helpfully and accurately.\n"
            "7. Adapt your conversation style based on their education level:\n"
            "   - For 10th/12th: Be friendly but professional, ask about interests, subjects they enjoy\n"
            "   - For UG/PG: Be more technical, ask about specialization, projects, career goals\n"
            "8. Remember what the user has told you in the conversation. Build on previous answers.\n"
            "9. Keep responses concise but informative - like a real career counselor would talk.\n"
            "10. After 3-4 questions, STOP asking and provide a comprehensive summary with career recommendations and roadmap."
        )
        
        # Count how many questions the bot has asked
        bot_question_count = 0
        collected_info = {}
        
        # Build conversation history
        messages = [{"role": "system", "content": sys_prompt}]
        
        if history:
            # Add recent conversation history (last 10 messages)
            for item in history[-10:]:
                role = item.get("role", "user")
                text = item.get("text", "")[:500]  # Limit length
                
                # Count bot questions
                if role in ["bot", "assistant"]:
                    if "?" in text or any(word in text.lower() for word in ["what", "how", "tell me", "can you", "do you"]):
                        bot_question_count += 1
                
                # Extract key information from user responses
                if role == "user":
                    text_lower = text.lower()
                    if any(word in text_lower for word in ["10th", "12th", "grade", "undergraduate", "ug", "postgraduate", "pg", "working"]):
                        collected_info["education"] = text
                    if any(word in text_lower for word in ["interest", "like", "love", "enjoy", "passion", "hobby"]):
                        collected_info["interests"] = text
                    if any(word in text_lower for word in ["goal", "want", "aspire", "dream", "become", "achieve"]):
                        collected_info["goals"] = text
                
                if role in ["user", "bot", "assistant"]:
                    # Map "bot" to "assistant" for OpenAI
                    messages.append({
                        "role": "assistant" if role == "bot" else role,
                        "content": text
                    })
        
        # Check if we have enough information (3-4 questions asked)
        has_enough_info = bot_question_count >= 3 and len(collected_info) >= 2
        
        # Add instruction message if we have enough info
        if has_enough_info:
            instruction = (
                f"You have asked {bot_question_count} questions and collected enough information. "
                f"NOW provide a comprehensive response with:\n"
                f"1. A brief 2-3 sentence summary about the user based on what they've told you\n"
                f"2. Top 3-4 career recommendations that match their profile (with brief explanations)\n"
                f"3. A clear action plan/roadmap with 5-7 specific next steps they should take\n\n"
                f"Format your response as:\n"
                f"SUMMARY: [2-3 sentence summary]\n\n"
                f"CAREER RECOMMENDATIONS:\n"
                f"1. [Career 1] - [Brief reason why it fits]\n"
                f"2. [Career 2] - [Brief reason why it fits]\n"
                f"3. [Career 3] - [Brief reason why it fits]\n\n"
                f"YOUR ROADMAP:\n"
                f"1. [Step 1]\n"
                f"2. [Step 2]\n"
                f"3. [Step 3]\n"
                f"4. [Step 4]\n"
                f"5. [Step 5]\n\n"
                f"Be warm, encouraging, and specific. Don't ask any more questions."
            )
            messages.append({"role": "system", "content": instruction})
        else:
            # Still collecting - remind about question limit
            reminder = (
                f"You have asked {bot_question_count} questions so far. "
                f"Focus on collecting: education level, interests, and career goals. "
                f"After 3-4 questions, provide a summary and roadmap instead of asking more."
            )
            messages.append({"role": "system", "content": reminder})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Call GPT-4 or GPT-3.5-turbo
        # Try GPT-4 first, fallback to GPT-3.5-turbo
        models_to_try = [
            "gpt-4o",  # Latest GPT-4 model
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        ]
        
        response = None
        last_error = None
        
        for model in models_to_try:
            try:
                print(f"DEBUG: Trying GPT model: {model}")
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000,
                    timeout=30
                )
                print(f"DEBUG: Successfully using GPT model: {model}")
                break
            except Exception as e:
                print(f"DEBUG: Failed with {model}: {str(e)}")
                last_error = str(e)
                continue
        
        if not response:
            raise Exception(f"All GPT models failed. Last error: {last_error}")
        
        # Extract reply
        reply = response.choices[0].message.content.strip()
        
        if not reply:
            print("DEBUG: No reply extracted from GPT response")
            return None
        
        return {
            "reply": reply[:1500],  # Limit response length
            "career": None,
            "fallback": True,
            "confidence": 0.8,  # GPT responses are generally high confidence
        }
        
    except Exception as e:
        print(f"DEBUG: Exception in gpt_fallback: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

