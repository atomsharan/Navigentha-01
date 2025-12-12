# chat/career_bot.py
from .utils.data_loader import load_dataset
from .utils.mentor_engine import mentor_engine
from .utils.ai_fallback import ai_fallback
from .utils.gemini_fallback import gemini_fallback
from .utils.gpt_fallback import gpt_fallback

# load once
CAREER_DATA = load_dataset("career_dataset.json")

def chat_with_bot(user_message: str, history=None) -> dict:
    """
    Returns a dictionary with reply and metadata.
    Uses Gemini first, then GPT as fallback for maximum capability.
    Can answer career questions and general questions.
    """
    # Try Gemini first (it's free and works well)
    gem = gemini_fallback(user_message, CAREER_DATA, history=history)
    if gem is not None:
        return gem
    
    # Fallback to GPT if Gemini fails (more capable, can answer anything)
    gpt_response = gpt_fallback(user_message, CAREER_DATA, history=history)
    if gpt_response is not None:
        return gpt_response
    
    # Final fallback to simple response if both AI services fail
    return {
        "reply": "I'm having trouble connecting to my AI assistant right now. Please try again in a moment.",
        "career": None,
        "fallback": True,
        "confidence": 0,
    }
