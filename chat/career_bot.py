# chat/career_bot.py
from .utils.data_loader import load_dataset
from .utils.mentor_engine import mentor_engine
from .utils.ai_fallback import ai_fallback
from .utils.gemini_fallback import gemini_fallback

# load once
CAREER_DATA = load_dataset("career_dataset.json")

def chat_with_bot(user_message: str, history=None) -> dict:
    """
    Returns a dictionary with reply and metadata.
    Uses ONLY Gemini API for career guidance.
    Collects information about college, interests, academic preferences, and provides calculated output with roadmap.
    """
    # Use Gemini only - no fallback to GPT
    gem = gemini_fallback(user_message, CAREER_DATA, history=history)
    if gem is not None:
        return gem
    
    # If Gemini fails, return a helpful error message
    # Check if API key exists
    from django.conf import settings
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    
    if not api_key:
        error_msg = "API key is not configured. Please set GEMINI_API_KEY in settings."
    else:
        error_msg = "I'm having trouble connecting to the AI service. This could be due to:\n- API key authentication issue\n- Network connectivity problem\n- Service temporarily unavailable\n\nPlease check the server logs for more details and try again in a moment."
    
    return {
        "reply": error_msg,
        "career": None,
        "fallback": True,
        "confidence": 0,
    }
