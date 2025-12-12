# chat/utils/mentor_engine.py
import re
import random
from typing import List, Tuple, Dict, Optional
try:
    from rapidfuzz import fuzz
    _HAS_RAPIDFUZZ = True
except Exception:
    _HAS_RAPIDFUZZ = False

def detect_stage(message: str) -> str:
    msg = message.lower()
    if re.search(r"\b(10th|tenth|class 10|grade 10|ssc|matric)\b", msg):
        return "10th"
    if re.search(r"\b(12th|twelfth|class 12|grade 12|hsc|intermediate|plus two|12th passed)\b", msg):
        return "12th"
    if re.search(r"\b(ug|undergrad|btech|b\\.tech|bsc|be|bachelor)\b", msg):
        return "UG"
    if re.search(r"\b(pg|postgrad|mtech|msc|mba|masters|phd)\b", msg):
        return "PG"
    return ""

def extract_interest(message: str) -> List[str]:
    msg = message.lower()
    mapping = {
        "coding": ["coding","programming","python","java","software","developer","web","it","cs","computer"],
        "medical": ["medical","doctor","mbbs","medicine","health","biotech","biology"],
        "design": ["design","ui","ux","graphic","editing","video","creative","art"],
        "commerce": ["commerce","bcom","business","finance","accounting"],
        "science": ["science","physics","chemistry","biology","research","bsc"],
    }
    found = []
    for key, kws in mapping.items():
        for kw in kws:
            if re.search(rf"\b{re.escape(kw)}\b", msg):
                found.append(key)
                break
    return list(dict.fromkeys(found))

def _score_message_against_career(msg: str, career: Dict) -> float:
    m = msg.lower()
    if _HAS_RAPIDFUZZ:
        s = 0
        s += 0.35 * fuzz.partial_ratio(m, career.get("name","").lower())
        s += 0.35 * fuzz.partial_ratio(m, " ".join(career.get("skills",[])).lower())
        s += 0.2 * fuzz.partial_ratio(m, career.get("description","").lower())
        s += 0.1 * fuzz.partial_ratio(m, " ".join(career.get("tags",[])).lower())
        return s
    else:
        s = 0
        if career.get("name","").lower() in m: s += 40
        s += 10 * sum(1 for w in career.get("skills",[]) if w.lower() in m)
        s += 5 * sum(1 for w in career.get("tags",[]) if w.lower() in m)
        return s

def improved_matching(message: str, careers: List[Dict], stage_bias: str = "") -> List[Tuple[Dict, float]]:
    """
    Return top matches (career, score). Stage-biased careers (matching user's stage) get small boost.
    """
    scored = []
    for c in careers:
        score = _score_message_against_career(message, c)
        # small boost if career stage matches detected stage
        if stage_bias and c.get("stage","").lower() == stage_bias.lower():
            score *= 1.15
        scored.append((c, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:5]

def format_response(career: Dict, session_stage: str, confidence: float) -> str:
    templates = career.get("mentor_templates", {}) or {}
    intel = career.get("intelligence_layer", {}) or {}

    if confidence > 75:
        opening = templates.get("encouragement") or f"Great! {career.get('name')} looks like a strong match."
    else:
        opening = f"I think {career.get('name')} could suit you."

    stage_text = ""
    if session_stage:
        stage_text = intel.get("stage_response",{}).get(session_stage, "")

    desc = career.get("description","")
    skills = ", ".join(career.get("skills",[])[:6])
    jobs = ", ".join(career.get("jobs",[])[:5])
    next_steps = ""
    if session_stage == "10th":
        next_steps = "Consider taking MPC (Maths/Physics/Chemistry) or relevant vocational options."
    elif session_stage == "12th":
        next_steps = "Look for suitable undergraduate programs or diploma options."

    encouragement = intel.get("interest_response") or random.choice(["Nice move!", "Great step!", "Keep going!"])

    parts = [p for p in [opening, stage_text, desc, f"Key skills: {skills}" if skills else "", f"Jobs: {jobs}" if jobs else "", next_steps, encouragement] if p]
    return "\n\n".join(parts)

def mentor_engine(user_message: str, career_data: List[Dict]) -> Optional[Dict]:
    """
    Primary entry: returns a dictionary with reply, career, and confidence.
    If no confident match, returns None to indicate fallback required.
    """
    msg = (user_message or "").strip()
    if not msg:
        return None

    stage = detect_stage(msg)
    interests = extract_interest(msg)

    # Try to find by tag/interest first
    matches = []
    if interests:
        for c in career_data:
            # match any tag that equals interest
            tags = [t.lower() for t in c.get("tags",[])]
            if any(i.lower() in tags for i in interests):
                matches.append((c, 90.0))  # strong tag match

    # if no tag matches, fuzzy match
    if not matches:
        scored = improved_matching(msg, career_data, stage_bias=stage)
        if scored and scored[0][1] > 45:
            matches = [scored[0]]

    if not matches:
        return None

    career, score = matches[0]
    confidence = float(score if isinstance(score, (int,float)) else 90.0)
    reply = format_response(career, stage, confidence)
    # Make roadmap answers sharper: if user asked for roadmap, append compact steps
    if "roadmap" in msg.lower() or "path" in msg.lower():
        steps = career.get("future_paths", [])[:6]
        if steps:
            bullet = "\n".join([f"- {s}" for s in steps])
            reply = f"{reply}\n\nRoadmap:\n{bullet}"

    return {
        "reply": reply,
        "career": career.get("name"),
        "stage": stage,
        "interests": interests,
        "confidence": confidence,
        "fallback": False,
    }
