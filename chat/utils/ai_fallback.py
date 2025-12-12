# chat/utils/ai_fallback.py
import re
import random
from typing import List, Dict

def detect_stage_simple(msg: str) -> str:
    m = msg.lower()
    if re.search(r"\b(10th|tenth|ssc|matric)\b", m): return "10th"
    if re.search(r"\b(12th|hsc|intermediate|12th passed|plus two)\b", m): return "12th"
    if re.search(r"\b(ug|btech|b\\.tech|bsc|be|bachelor)\b", m): return "UG"
    if re.search(r"\b(pg|mtech|msc|mba|postgrad)\b", m): return "PG"
    return ""

def detect_interest_simple(msg: str) -> str:
    m = msg.lower()
    if re.search(r"\b(coding|programming|python|java|software|developer|it|cs)\b", m): return "coding"
    if re.search(r"\b(medical|doctor|mbbs|medicine|health)\b", m): return "medical"
    if re.search(r"\b(design|ui|ux|graphic|creative|editing)\b", m): return "design"
    if re.search(r"\b(commerce|business|finance|accounting|bcom)\b", m): return "commerce"
    if re.search(r"\b(science|physics|chemistry|biology|research)\b", m): return "science"
    return ""

def ai_fallback(user_message: str, career_data: List[Dict]) -> Dict:
    msg = (user_message or "").strip()
    stage = detect_stage_simple(msg)
    interest = detect_interest_simple(msg)

    # Prefer to suggest careers at same stage
    candidates = []
    if stage:
        for c in career_data:
            if c.get("stage","").lower() == stage.lower():
                # if interest present prefer tags match
                tags = [t.lower() for t in c.get("tags",[])]
                if interest and interest.lower() in tags:
                    candidates.insert(0, c)
                else:
                    candidates.append(c)

    # If no candidates, pick any by interest, else random
    if not candidates and interest:
        for c in career_data:
            tags = [t.lower() for t in c.get("tags",[])]
            if interest.lower() in tags:
                candidates.append(c)

    if candidates:
        chosen = candidates[0]
        skills = ", ".join(chosen.get("skills",[])[:6])
        future = ", ".join(chosen.get("future_paths",[])[:5])
        reply = (f"Since you're at {stage or 'your current stage'} and interested in {interest or 'this area'}, "
                 f"{chosen.get('name')} is a practical option. It builds {skills}. Paths include: {future}. "
                 f"{random.choice(['Great step!', 'Nice choice!', 'Keep exploring!'])}")
        return {
            "reply": reply,
            "career": chosen.get("name"),
            "stage": stage,
            "interests": [interest] if interest else [],
            "confidence": 0,
            "fallback": True,
        }

    # final gentle probe
    if stage:
        reply = f"You're at {stage}. Are you more into coding, science, commerce or arts? Tell me one word so I can suggest a path."
    else:
        reply = "I didn’t get that — tell me your stage (10th/12th/UG/PG) and whether you like coding, science, commerce or arts."
    
    return {
        "reply": reply,
        "career": None,
        "stage": stage,
        "interests": [],
        "confidence": 0,
        "fallback": True,
    }
