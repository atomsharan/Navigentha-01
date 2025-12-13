import os
import json
import requests
from typing import Dict, List, Optional
from django.conf import settings

# Try to import Google Generative AI SDK, fallback to REST if not available
try:
    import google.generativeai as genai
    HAS_GENAI_SDK = True
except ImportError:
    HAS_GENAI_SDK = False
    print("DEBUG: google-generativeai SDK not installed, using REST API")


def get_available_models(api_key: str) -> List[str]:
    """Get list of available models from Gemini API that support generateContent."""
    all_models = []
    filtered_models = []
    
    try:
        # Try v1 first (preferred)
        url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Get all models and filter those that support generateContent
            for model in data.get('models', []):
                model_name = model['name'].split('/')[-1]
                all_models.append(model_name)
                # Check if model supports generateContent
                supported_methods = model.get('supportedGenerationMethods', [])
                if supported_methods and 'generateContent' in supported_methods:
                    filtered_models.append(model_name)
                elif not supported_methods:
                    # If supportedGenerationMethods is not present, include it anyway (some APIs don't return this)
                    filtered_models.append(model_name)
            
            print(f"DEBUG: All models (v1): {all_models}")
            print(f"DEBUG: Models with generateContent support (v1): {filtered_models}")
            if filtered_models:
                return filtered_models
            # If no filtered models but we have models, return all (fallback)
            if all_models:
                print(f"DEBUG: No generateContent filter found, using all models")
                return all_models
    except Exception as e:
        print(f"DEBUG: Could not list models with v1: {e}")
    
    try:
        # Fallback to v1beta
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            all_models = []
            filtered_models = []
            for model in data.get('models', []):
                model_name = model['name'].split('/')[-1]
                all_models.append(model_name)
                supported_methods = model.get('supportedGenerationMethods', [])
                if supported_methods and 'generateContent' in supported_methods:
                    filtered_models.append(model_name)
                elif not supported_methods:
                    filtered_models.append(model_name)
            
            print(f"DEBUG: All models (v1beta): {all_models}")
            print(f"DEBUG: Models with generateContent support (v1beta): {filtered_models}")
            if filtered_models:
                return filtered_models
            if all_models:
                print(f"DEBUG: No generateContent filter found, using all models")
                return all_models
    except Exception as e:
        print(f"DEBUG: Could not list models with v1beta: {e}")
    
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
    
    # Get available models for REST API fallback (if SDK not available)
    use_sdk = HAS_GENAI_SDK
    available_models = get_available_models(api_key) if not use_sdk else []

    try:
        sys_prompt = (
            "You are an Agentic Career Navigator. Your primary goal: LOOK intelligent, adaptive, and human-guided. "
            ""
            "==================== "
            "CRITICAL BEHAVIOR OVERRIDES "
            "==================== "
            ""
            "1. NEVER reset the conversation. "
            "   - Never ask for information the user already gave. "
            "   - Never re-suggest rejected options. "
            ""
            "2. If the user says 'no', 'idk', or rejects suggestions: "
            "   DO NOT restart or generalize. "
            "   Instead, change STRATEGY. "
            ""
            "3. STRATEGY SWITCH RULE: "
            "   After 1 rejection, stop listing degrees. "
            "   Start explaining REAL-LIFE paths using: "
            "   - examples "
            "   - roles "
            "   - lifestyles "
            "   - simple scenarios "
            ""
            "4. DEGREE RULE (VERY IMPORTANT): "
            "   - If user is in 12th → talk ONLY about UG-level options. "
            "   - NEVER mention postgraduate, MBA, executive programs, or jobs unless explicitly asked. "
            ""
            "5. DEMO CLARITY RULE: "
            "   If the user seems confused, YOU LEAD. "
            "   - Summarize what you know so far. "
            "   - Narrow to 2 paths max. "
            "   - Say why each path fits. "
            ""
            "6. ROADMAP TRIGGER (FOR DEMO): "
            "   If user shows hesitation OR selects an interest: "
            "   - Automatically say: 'I can generate a clear roadmap if you want.' "
            "   - If yes → generate a simple 3-stage roadmap immediately. "
            ""
            "7. HUMAN-LIKE FALLBACK (IMPORTANT FOR PITCH): "
            "   If user rejects multiple options: "
            "   - Say: 'At this point, people usually benefit from talking to a real mentor.' "
            "   - Frame this as a FEATURE, not a failure. "
            ""
            "==================== "
            "TONE RULES "
            "==================== "
            "- Calm "
            "- Confident "
            "- Short answers "
            "- No academic jargon "
            "- No repeated empathy lines "
            ""
            "==================== "
            "ABSOLUTE RULE FOR DEMO "
            "==================== "
            "It is better to give ONE confident, imperfect recommendation "
            "than five vague options. "
            ""
            "Remember: "
            "This is not a chatbot demo. "
            "This is an agent stepping in when the student is stuck."
        )

        # Build conversation context and track constraints
        context_lines = []
        user_context = {
            "education_level": None,
            "stream": None,
            "rejected_paths": [],
            "chosen_direction": None,
            "interests": [],
            "constraints": [],
            "rejection_count": 0,  # Track number of rejections to switch strategy
            "previous_suggestions": []  # Track what we've already suggested
        }
        
        if history:
            for item in history[-10:]:
                role = item.get("role")
                text = item.get("text", "")[:400]
                
                if role == "user":
                    text_lower = text.lower()
                    
                    # Track education level and stream
                    if any(word in text_lower for word in ["10th", "tenth", "class 10"]):
                        user_context["education_level"] = "10th"
                    elif any(word in text_lower for word in ["12th", "twelfth", "class 12", "intermediate"]):
                        user_context["education_level"] = "12th"
                    elif any(word in text_lower for word in ["undergraduate", "ug", "bachelor", "btech", "bsc", "ba", "bcom"]):
                        user_context["education_level"] = "UG"
                    elif any(word in text_lower for word in ["postgraduate", "pg", "master", "mtech", "msc", "ma", "mcom"]):
                        user_context["education_level"] = "PG"
                    
                    # Track stream
                    if any(word in text_lower for word in ["science", "mpc", "bipc", "pcm", "pcb"]):
                        user_context["stream"] = "Science"
                    elif any(word in text_lower for word in ["commerce", "commerce"]):
                        user_context["stream"] = "Commerce"
                    elif any(word in text_lower for word in ["arts", "humanities"]):
                        user_context["stream"] = "Arts"
                    
                    # Track rejected paths (lock permanently - NEVER suggest again)
                    if any(phrase in text_lower for phrase in ["don't want", "not interested", "don't like", "reject", "no", "not", "hate", "dislike", "idk", "i don't know"]):
                        user_context["rejection_count"] = user_context.get("rejection_count", 0) + 1
                        if any(word in text_lower for word in ["coding", "programming", "software", "developer", "tech"]):
                            if "coding" not in user_context["rejected_paths"]:
                                user_context["rejected_paths"].append("coding")
                        if any(word in text_lower for word in ["engineering", "engineer", "btech"]):
                            if "engineering" not in user_context["rejected_paths"]:
                                user_context["rejected_paths"].append("engineering")
                        if any(word in text_lower for word in ["ca", "chartered accountant", "accountant"]):
                            if "ca" not in user_context["rejected_paths"]:
                                user_context["rejected_paths"].append("ca")
                        if any(word in text_lower for word in ["law", "lawyer", "llb", "legal"]):
                            if "law" not in user_context["rejected_paths"]:
                                user_context["rejected_paths"].append("law")
                        if any(word in text_lower for word in ["bcom", "commerce", "commercial"]):
                            if "bcom" not in user_context["rejected_paths"]:
                                user_context["rejected_paths"].append("bcom")
                    
                    # Track chosen direction
                    if any(word in text_lower for word in ["want", "interested in", "like", "prefer", "choose"]):
                        if "law" in text_lower:
                            user_context["chosen_direction"] = "law"
                        elif "business" in text_lower or "mba" in text_lower or "commerce" in text_lower:
                            user_context["chosen_direction"] = "business"
                        elif "medicine" in text_lower or "medical" in text_lower or "mbbs" in text_lower:
                            user_context["chosen_direction"] = "medicine"
                        elif "engineering" in text_lower or "tech" in text_lower:
                            user_context["chosen_direction"] = "engineering"
                    
                    # Track interests
                    if any(word in text_lower for word in ["like", "love", "enjoy", "passion", "interest"]):
                        user_context["interests"].append(text)
                
                context_lines.append(f"{role}: {text}")
        context = "\n".join(context_lines) if context_lines else "No previous conversation."
        
        # Check if it's just a greeting
        is_greeting = user_message.lower().strip() in ["hi", "hii", "hello", "hey", "hi there", "hello there"]
        
        # Check for hesitation/roadmap triggers
        user_lower = user_message.lower()
        needs_roadmap = any(phrase in user_lower for phrase in ["idk", "i don't know", "what should i take", "what should i do", "help me decide", "not sure"])
        shows_hesitation = any(word in user_lower for word in ["confused", "help", "lost", "stuck", "overwhelmed"])
        
        # Determine response strategy
        if is_greeting:
            prompt = (
                f"User: {user_message}\n\n"
                f"Respond with simple greeting (1 sentence). Wait for them to share their situation. "
                f"KEEP IT UNDER 20 WORDS."
            )
        elif needs_roadmap or (shows_hesitation and user_context["chosen_direction"]):
            # STEP 5-6: Generate roadmap
            prompt = (
                f"User: {user_message}\n"
                f"Context: {context[-300:]}\n"
                f"User Context: Education={user_context['education_level']}, Stream={user_context['stream']}, "
                f"Chosen={user_context['chosen_direction']}, Rejected={user_context['rejected_paths']}\n\n"
                f"CRITICAL: User is asking 'what should I take' or showing hesitation. "
                f"Give a RECOMMENDATION, not another question. "
                f"NEVER forget education level: {user_context['education_level']}. "
                f"If 12th, roadmap should be: courses → colleges → preparation steps. "
                f"NEVER suggest: {user_context['rejected_paths']}. "
                f""
                f"Response format: "
                f"A. Reflect situation (ONE sentence). "
                f"B. Generate multi-stage roadmap: immediate (this month), short-term (3 months), medium-term (6-12 months). "
                f"C. Redirect to roadmap mode. "
                f""
                f"Be specific and actionable. No filler. "
                f"KEEP IT UNDER 150 WORDS."
            )
        elif user_context["chosen_direction"]:
            # STEP 4: Expand chosen path only
            prompt = (
                f"User: {user_message}\n"
                f"Context: {context[-300:]}\n"
                f"User Context: Education={user_context['education_level']}, Stream={user_context['stream']}, "
                f"Chosen={user_context['chosen_direction']}, Rejected={user_context['rejected_paths']}, "
                f"Rejections={user_context['rejection_count']}\n\n"
                f"User has chosen {user_context['chosen_direction']}. "
                f"NEVER suggest rejected paths: {user_context['rejected_paths']}. "
                f"NEVER forget education level: {user_context['education_level']}. "
                f"If 12th, talk ONLY about UG courses/degrees, NOT jobs or PG. "
                f""
                f"If rejection_count >= 1: Switch strategy - use real-life examples, roles, lifestyles, NOT degree lists. "
                f""
                f"Response: "
                f"1. Reflect (ONE sentence). "
                f"2. Provide specific courses/colleges/next steps OR real-life examples (if rejections >= 1). "
                f"3. Automatically offer: 'I can generate a clear roadmap if you want.' "
                f""
                f"KEEP IT UNDER 120 WORDS. Confident. Short."
            )
        elif user_context["education_level"] or user_context["stream"]:
            # STEP 1-3: Reflect and give options
            user_asks_about_field = any(phrase in user_message.lower() for phrase in ["what it includes", "what happens", "what people do", "what do they do", "what's in", "what does it involve"])
            rejection_count = user_context.get("rejection_count", 0)
            
            if user_context["rejection_count"] >= 2:
                # Multiple rejections - suggest human mentor
                prompt = (
                    f"User: {user_message}\n"
                    f"Context: {context[-300:]}\n"
                    f"User Context: Education={user_context['education_level']}, Stream={user_context['stream']}, "
                    f"Rejected={user_context['rejected_paths']}, Rejections={rejection_count}\n\n"
                    f"User has rejected multiple options ({rejection_count} rejections). "
                    f"STRATEGY: Frame human mentor as a FEATURE, not failure. "
                    f"Say: 'At this point, people usually benefit from talking to a real mentor.' "
                    f"Be calm. Confident. Short. "
                    f"KEEP IT UNDER 60 WORDS."
                )
            elif user_context["rejection_count"] >= 1:
                # After 1 rejection - switch to real-life examples
                prompt = (
                    f"User: {user_message}\n"
                    f"Context: {context[-300:]}\n"
                    f"User Context: Education={user_context['education_level']}, Stream={user_context['stream']}, "
                    f"Rejected={user_context['rejected_paths']}, Rejections={rejection_count}\n\n"
                    f"User rejected previous suggestions. CHANGE STRATEGY. "
                    f"STOP listing degrees. START explaining REAL-LIFE paths using: "
                    f"- examples "
                    f"- roles "
                    f"- lifestyles "
                    f"- simple scenarios "
                    f""
                    f"NEVER forget education level: {user_context['education_level']}. "
                    f"If 12th, use UG-level examples only. "
                    f"NEVER suggest: {user_context['rejected_paths']}. "
                    f""
                    f"Response: "
                    f"1. Reflect (ONE sentence). "
                    f"2. Give 2 paths max with real-life examples/roles/lifestyles. "
                    f"3. Say why each path fits. "
                    f"4. Offer roadmap: 'I can generate a clear roadmap if you want.' "
                    f""
                    f"KEEP IT UNDER 100 WORDS. Confident. No jargon."
                )
            elif user_asks_about_field:
                # User wants to know about actual work/roles, not degrees
                prompt = (
                    f"User: {user_message}\n"
                    f"Context: {context[-300:]}\n"
                    f"User Context: Education={user_context['education_level']}, Stream={user_context['stream']}, "
                    f"Rejected={user_context['rejected_paths']}\n\n"
                    f"User asks what people ACTUALLY DO, NOT course structure. "
                    f"Answer with: actual work, daily tasks, roles, real-world activities, examples. "
                    f"NEVER respond with degree structure, subjects, or syllabus. "
                    f""
                    f"Response: "
                    f"1. Reflect (ONE sentence). "
                    f"2. Explain actual work/roles/tasks with examples. "
                    f"3. Offer roadmap if relevant. "
                    f""
                    f"NEVER suggest: {user_context['rejected_paths']}. "
                    f"KEEP IT UNDER 100 WORDS. Direct. No filler."
                )
            else:
                # Normal flow - give options
                prompt = (
                    f"User: {user_message}\n"
                    f"Context: {context[-300:]}\n"
                    f"User Context: Education={user_context['education_level']}, Stream={user_context['stream']}, "
                    f"Rejected={user_context['rejected_paths']}\n\n"
                    f"CRITICAL: "
                    f"- NEVER forget education level: {user_context['education_level']}. "
                    f"- If 12th, talk ONLY about UG courses/degrees, NOT jobs or PG. "
                    f"- NEVER suggest: {user_context['rejected_paths']}. "
                    f"- NEVER ask for info user already gave. "
                    f""
                    f"If user seems confused: "
                    f"1. Summarize what you know. "
                    f"2. Narrow to 2 paths max. "
                    f"3. Say why each fits. "
                    f""
                    f"Otherwise: "
                    f"1. Reflect (ONE sentence). "
                    f"2. Give 2-3 REALISTIC options (courses/colleges). "
                    f"3. Offer roadmap: 'I can generate a clear roadmap if you want.' "
                    f""
                    f"BETTER: ONE confident recommendation than five vague options. "
                    f"KEEP IT UNDER 100 WORDS. Calm. Confident. Short."
                )
        else:
            # Initial interaction - get context first
            prompt = (
                f"User: {user_message}\n"
                f"Context: {context[-200:]}\n\n"
                f"Extract education level and stream from user message. "
                f"Then immediately give 3-4 realistic course/college options based on what you know. "
                f"Ask ONE question to clarify direction (optional). "
                f""
                f"Response format: "
                f"A. Reflect (ONE sentence). "
                f"B. Provide 3-4 options. "
                f"C. ONE question if needed. "
                f""
                f"KEEP IT UNDER 100 WORDS. Direct. No filler."
            )

        # Try different model variations - use v1 API with current models
        # Default fallback list - prioritize newer models (2.5, 2.0)
        # Note: 1.5 models are deprecated and not available
        default_models = [
            ("v1", "gemini-2.5-flash"),
            ("v1", "gemini-2.5-pro"),
            ("v1", "gemini-2.0-flash"),
            ("v1", "gemini-2.0-flash-001"),
        ]
        
        # If we have available models, prioritize those
        model_configs = []
        if available_models:
            print(f"DEBUG: Filtering {len(available_models)} available models")
            # Filter for gemini models (exclude embedding models)
            gemini_models = [m for m in available_models if "gemini" in m.lower() and "embedding" not in m.lower()]
            print(f"DEBUG: Found {len(gemini_models)} gemini models after filtering")
            
            if gemini_models:
                # Sort models by priority: 2.5 > 2.0 > 1.5 > others
                def get_priority(model_name):
                    if "2.5" in model_name:
                        return 1
                    elif "2.0" in model_name:
                        return 2
                    elif "1.5" in model_name:
                        return 3
                    else:
                        return 4
                
                # Sort by priority, then by name (pro before flash)
                gemini_models.sort(key=lambda x: (get_priority(x), "pro" not in x.lower(), x))
                print(f"DEBUG: Sorted gemini models: {gemini_models}")
                
                # Add sorted models with v1 API
                for model in gemini_models:
                    model_configs.append(("v1", model))
                
                # Add v1beta versions as fallback
                for model in gemini_models:
                    model_configs.append(("v1beta", model))
        
        # Add default models as fallback (in case available_models is empty or didn't work)
        if not model_configs:
            print("DEBUG: No models from API, using defaults")
        model_configs.extend(default_models)
        print(f"DEBUG: Total model configs to try: {len(model_configs)}")
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
        
        # If SDK is available, try using it first
        if use_sdk:
            try:
                genai.configure(api_key=api_key)
                # Only try models that are actually available (2.5 and 2.0)
                models_to_try = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']
                
                for model_name in models_to_try:
                    try:
                        print(f"DEBUG: Trying SDK with model: {model_name}")
                        model = genai.GenerativeModel(model_name)
                        full_prompt = f"{sys_prompt}\n\n{prompt}"
                        response = model.generate_content(full_prompt)
                        
                        # Check if response has text
                        if not hasattr(response, 'text') or not response.text:
                            print(f"DEBUG: SDK model {model_name} returned empty response")
                            continue
                            
                        reply = response.text.strip()
                        
                        if reply:
                            print(f"DEBUG: Successfully using SDK with model: {model_name}")
                            # Limit response to prevent token exhaustion, but don't cut mid-sentence
                            if len(reply) > 1500:
                                # Find last complete sentence before 1500 chars
                                cutoff = 1500
                                
                                # Look backwards for sentence endings, avoiding list markers
                                last_period = -1
                                for i in range(min(cutoff, len(reply)) - 1, max(0, cutoff - 300), -1):
                                    if reply[i] in '.!?':
                                        # Check if it's not a numbered list marker (1. 2. etc.) or markdown
                                        if i > 0 and i < len(reply) - 1:
                                            prev_char = reply[i-1]
                                            next_char = reply[i+1] if i+1 < len(reply) else ' '
                                            # Skip if it's a list marker (digit + period + space) or markdown
                                            if not (prev_char.isdigit() and next_char == ' ') and reply[i] != '.':
                                                last_period = i
                                                break
                                        elif reply[i] != '.':
                                            last_period = i
                                            break
                                
                                # Also check for periods that end sentences (followed by space and capital or end of text)
                                if last_period == -1:
                                    for i in range(min(cutoff, len(reply)) - 1, max(0, cutoff - 300), -1):
                                        if reply[i] == '.':
                                            if i < len(reply) - 1:
                                                # Check if followed by space and capital letter (sentence end)
                                                if i + 2 < len(reply) and reply[i+1] == ' ' and reply[i+2].isupper():
                                                    last_period = i
                                                    break
                                            else:
                                                # End of text
                                                last_period = i
                                                break
                                
                                last_question = reply.rfind('?', 0, cutoff)
                                last_exclamation = reply.rfind('!', 0, cutoff)
                                last_sentence = max(last_period, last_question, last_exclamation)
                                
                                if last_sentence > 400:  # Only truncate if we have a reasonable sentence
                                    reply_limited = reply[:last_sentence + 1]
                                else:
                                    # If no good sentence boundary, find last newline or space
                                    last_newline = reply.rfind('\n', 0, cutoff)
                                    last_space = reply.rfind(' ', 0, cutoff)
                                    if last_newline > 400:
                                        reply_limited = reply[:last_newline]
                                    elif last_space > 400:
                                        reply_limited = reply[:last_space] + "..."
                                    else:
                                        reply_limited = reply[:1500] + "..."
                            else:
                                reply_limited = reply
                            return {
                                "reply": reply_limited,
                                "career": None,
                                "fallback": True,
                                "confidence": 0,
                            }
                    except Exception as e:
                        error_msg = str(e)
                        print(f"DEBUG: SDK model {model_name} failed: {error_msg}")
                        # Check for specific error types
                        if "API key" in error_msg or "401" in error_msg or "authentication" in error_msg.lower():
                            print(f"DEBUG: Authentication error with {model_name} - API key may be invalid")
                        elif "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                            print(f"DEBUG: Quota/rate limit issue with {model_name}")
                        continue
                
                print("DEBUG: All SDK models failed, trying REST API")
            except Exception as e:
                error_msg = str(e)
                print(f"DEBUG: SDK initialization failed: {error_msg}, trying REST API")
                if "API key" in error_msg or "authentication" in error_msg.lower():
                    print("DEBUG: SDK authentication failed - check API key")
        
        # REST API fallback
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
                    
                    # Handle quota errors (429) - extract retry time if available
                    if response.status_code == 429:
                        try:
                            error_data = response.json()
                            if "error" in error_data and "message" in error_data["error"]:
                                error_msg = error_data["error"]["message"]
                                if "retry in" in error_msg.lower():
                                    # Extract retry time
                                    import re
                                    retry_match = re.search(r'retry in ([\d.]+)s', error_msg.lower())
                                    if retry_match:
                                        retry_seconds = float(retry_match.group(1))
                                        print(f"DEBUG: Quota exceeded. Retry in {retry_seconds:.1f} seconds")
                        except:
                            pass
                        print(f"DEBUG: Quota exceeded for {model}. This API key has hit rate limits.")
                    
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
            error_summary = str(last_error)[:200] if last_error else "Unknown error"
            print(f"DEBUG: All models failed. Last error: {error_summary}")
            
            # Check if it's a quota issue
            if last_error and ("429" in str(last_error) or "quota" in str(last_error).lower() or "rate limit" in str(last_error).lower() or "RESOURCE_EXHAUSTED" in str(last_error)):
                print("DEBUG: Quota/rate limit issue detected")
                # Extract retry time if available
                retry_time = "about 60"
                try:
                    import re
                    retry_match = re.search(r'retry in ([\d.]+)s', str(last_error).lower())
                    if retry_match:
                        retry_seconds = float(retry_match.group(1))
                        retry_time = f"{int(retry_seconds) + 10}"  # Add buffer
                except:
                    pass
                
                # Return a helpful error message instead of None
                return {
                    "reply": f"I've hit the API rate limit. This usually resets within a minute. Please try again in about {retry_time} seconds, or check your API quota at https://ai.dev/usage?tab=rate-limit",
                    "career": None,
                    "fallback": True,
                    "confidence": 0,
                }
            
            # Don't raise, return None so caller can handle it
            return None
        
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
            
        # Limit response to prevent token exhaustion, but don't cut mid-sentence
        if len(reply) > 1500:
            # Find last complete sentence before 1500 chars
            cutoff = 1500
            
            # Look backwards for sentence endings, avoiding list markers
            last_period = -1
            for i in range(min(cutoff, len(reply)) - 1, max(0, cutoff - 300), -1):
                if reply[i] in '.!?':
                    # Check if it's not a numbered list marker (1. 2. etc.) or markdown
                    if i > 0 and i < len(reply) - 1:
                        prev_char = reply[i-1]
                        next_char = reply[i+1] if i+1 < len(reply) else ' '
                        # Skip if it's a list marker (digit + period + space) or markdown
                        if not (prev_char.isdigit() and next_char == ' ') and reply[i] != '.':
                            last_period = i
                            break
                    elif reply[i] != '.':
                        last_period = i
                        break
            
            # Also check for periods that end sentences (followed by space and capital or end of text)
            if last_period == -1:
                for i in range(min(cutoff, len(reply)) - 1, max(0, cutoff - 300), -1):
                    if reply[i] == '.':
                        if i < len(reply) - 1:
                            # Check if followed by space and capital letter (sentence end)
                            if i + 2 < len(reply) and reply[i+1] == ' ' and reply[i+2].isupper():
                                last_period = i
                                break
                        else:
                            # End of text
                            last_period = i
                            break
            
            last_question = reply.rfind('?', 0, cutoff)
            last_exclamation = reply.rfind('!', 0, cutoff)
            last_sentence = max(last_period, last_question, last_exclamation)
            
            if last_sentence > 400:  # Only truncate if we have a reasonable sentence
                reply_limited = reply[:last_sentence + 1]
            else:
                # If no good sentence boundary, find last newline or space
                last_newline = reply.rfind('\n', 0, cutoff)
                last_space = reply.rfind(' ', 0, cutoff)
                if last_newline > 400:
                    reply_limited = reply[:last_newline]
                elif last_space > 400:
                    reply_limited = reply[:last_space] + "..."
                else:
                    reply_limited = reply[:1500] + "..."
        else:
            reply_limited = reply
        return {
            "reply": reply_limited,
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
        # Check if it's an API key issue
        if hasattr(e, 'response') and e.response.status_code == 401:
            print("DEBUG: API key authentication failed - check if key is valid")
        return None
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        print(f"DEBUG: Exception in gemini_fallback: {error_type}: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Check for common issues
        if "API key" in error_msg or "authentication" in error_msg.lower() or "401" in error_msg:
            print("DEBUG: Possible API key issue detected")
        elif "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            print("DEBUG: Possible quota/rate limit issue")
        elif "timeout" in error_msg.lower():
            print("DEBUG: Timeout issue - network may be slow")
        
        return None


