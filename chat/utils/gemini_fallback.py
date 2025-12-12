import os
import json
import requests
from typing import Dict, List, Optional
from django.conf import settings


def get_available_models(api_key: str) -> List[str]:
    """Get list of available models from Gemini API."""
    try:
        # Try v1beta first
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            models = [model['name'].split('/')[-1] for model in data.get('models', [])]
            print(f"DEBUG: Available models (v1beta): {models}")
            return models
    except Exception as e:
        print(f"DEBUG: Could not list models: {e}")
    return []


def gemini_fallback(user_message: str, career_data: List[Dict], history: Optional[List[Dict]] = None) -> Optional[Dict]:
    """Use Google Gemini REST API as an optional smarter fallback.

    Returns None if Gemini is not available or fails, so callers can try another path.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("DEBUG: No API key found")
        print(f"DEBUG: Settings GEMINI_API_KEY: {getattr(settings, 'GEMINI_API_KEY', 'NOT SET')}")
        return None
    print(f"DEBUG: API key loaded: {api_key[:10]}...{api_key[-5:]}")
    
    # Get available models
    available_models = get_available_models(api_key)

    try:
        sys_prompt = (
            "You are a professional career mentor from India. Be warm but professional. "
            "CRITICAL RULES: "
            "1. Ask ONLY ONE question at a time. Don't overwhelm the student. "
            "2. Ask MAXIMUM 3-4 questions total. After that, provide a summary and career roadmap. "
            "3. NEVER assume the student's education level, age, grade, or background unless they explicitly mention it. "
            "4. ALWAYS read the conversation history carefully and respond based on what the student has actually said. "
            "5. If the student mentions an interest (like 'I love arts' or 'I love coding'), ask about their current education level first. "
            "6. Then ask about specific aspects of their interest to understand their passion better. "
            "7. Based on their education level, adapt your conversation style: "
            "   - For 10th/12th: Be friendly but professional, ask about interests, subjects they enjoy, family support "
            "   - For UG/PG: Be more technical, ask about specialization, projects, career goals, internships "
            "8. ALWAYS remember what the student has told you in the conversation. Don't contradict or ignore their previous answers. "
            "9. After 3-4 questions, STOP asking and provide a comprehensive summary with career recommendations and roadmap. "
            "10. Keep responses professional and concise - like a real career counselor would talk."
        )

        # Count how many questions the bot has asked
        bot_question_count = 0
        context_lines = []
        collected_info = {}
        
        if history:
            for item in history[-10:]:
                role = item.get("role")
                text = item.get("text", "")[:400]
                
                # Count bot questions (messages ending with ? or asking questions)
                if role == "bot":
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
                
                # Skip old rule-based responses that contain assumptions
                if role == "bot" and any(phrase in text.lower() for phrase in ["10th", "12th", "ug", "pg", "i think", "could suit you", "key skills", "jobs:"]):
                    continue
                # Skip user messages that contain grade assumptions from old conversations
                if role == "user" and any(phrase in text.lower() for phrase in ["i am 10th", "i am 12th", "i am in 10th", "i am in 12th"]):
                    continue
                context_lines.append(f"{role}: {text}")
        context = "\n".join(context_lines)
        
        # Check if we have enough information (3-4 questions asked)
        has_enough_info = bot_question_count >= 3 and len(collected_info) >= 2
        
        if has_enough_info:
            # Provide summary and roadmap instead of asking more questions
            prompt = (
                f"Previous conversation:\n{context}\n\n"
                f"Student says: {user_message}\n\n"
                f"You have asked {bot_question_count} questions and collected enough information. "
                f"NOW provide a comprehensive response with:\n"
                f"1. A brief 2-3 sentence summary about the student based on what they've told you\n"
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
        else:
            # Still collecting information - ask one focused question
            prompt = (
                f"Previous conversation:\n{context}\n\n"
                f"Student says: {user_message}\n\n"
                f"You have asked {bot_question_count} questions so far. "
                f"Respond as a professional career mentor. Follow these rules: "
                f"1. Ask ONLY ONE question at a time. "
                f"2. Focus on collecting: education level, interests, and career goals. "
                f"3. After 3-4 questions, you will provide a summary and roadmap. "
                f"4. NEVER assume their education level, age, or grade unless they explicitly mention it in THIS message. "
                f"5. ALWAYS remember what the student has told you in THIS conversation. "
                f"6. Build conversation naturally. Be professional, warm, and concise."
            )

        # Try different model variations - prioritize available models if we found them
        # Default fallback list if we couldn't query available models
        default_models = [
            ("v1beta", "gemini-1.5-flash"),
            ("v1beta", "gemini-1.5-flash-latest"),
            ("v1beta", "gemini-1.5-pro-latest"),
            ("v1", "gemini-1.5-flash"),
            ("v1", "gemini-1.5-pro"),
            ("v1beta", "gemini-pro"),
        ]
        
        # If we have available models, prioritize those
        model_configs = []
        if available_models:
            # Add available models first with v1beta
            for model in available_models:
                if "gemini" in model.lower():
                    model_configs.append(("v1beta", model))
            # Then add v1 versions
            for model in available_models:
                if "gemini" in model.lower():
                    model_configs.append(("v1", model))
        
        # Add default models if we don't have any or as fallback
        model_configs.extend(default_models)
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"{sys_prompt}\n\n{prompt}"
                        }
                    ]
                }
            ]
        }

        data = None
        last_error = None
        
        for api_version, model in model_configs:
            url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={api_key}"
            print(f"DEBUG: Trying API {api_version} with model: {model}")
            print(f"DEBUG: URL: {url.split('?')[0]}")
            
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                print(f"DEBUG: Response status: {response.status_code}")
                
                # Check for HTTP errors
                if response.status_code != 200:
                    error_text = response.text
                    print(f"DEBUG: HTTP Error - Status: {response.status_code}")
                    print(f"DEBUG: Error Body: {error_text[:500]}")
                    last_error = error_text
                    continue  # Try next model
                
                data = response.json()
                print(f"DEBUG: Response data keys: {list(data.keys())}")
                
                # Check for API errors in response
                if "error" in data:
                    error_msg = str(data['error'])
                    print(f"DEBUG: API Error in response: {error_msg}")
                    last_error = error_msg
                    continue  # Try next model
                
                # Success!
                print(f"DEBUG: Successfully using API {api_version} with model: {model}")
                break
                
            except Exception as e:
                print(f"DEBUG: Exception with {api_version}/{model}: {e}")
                last_error = str(e)
                continue
        
        if data is None:
            raise Exception(f"All models failed. Last error: {last_error}")
        
        reply = ""
        
        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                parts = candidate["content"]["parts"]
                if len(parts) > 0 and "text" in parts[0]:
                    reply = parts[0]["text"].strip()
        
        if not reply:
            print(f"DEBUG: No reply extracted from response. Full response: {data}")
            return None
            
        return {
            "reply": reply[:1200],
            "career": None,
            "fallback": True,
            "confidence": 0,
        }
    except requests.exceptions.Timeout:
        return {
            "reply": "I'm experiencing some connectivity issues with my AI assistant. Here's some general career advice: Since you love coding, consider pursuing Software Engineering, Data Science, or Web Development. For a roadmap, focus on learning programming languages like Python or JavaScript, building projects, and gaining practical experience through internships or freelancing.",
            "career": None,
            "fallback": True,
            "confidence": 0,
        }
    except requests.exceptions.HTTPError as e:
        print(f"DEBUG: HTTP Error: {e}")
        print(f"DEBUG: Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        return None
    except Exception as e:
        print(f"DEBUG: Exception in gemini_fallback: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


