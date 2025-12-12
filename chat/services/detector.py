import re
from rapidfuzz import fuzz
from core.models import Career, Mentor

STAGE_PATTERNS = {
    "10th": r"\b(10th|class 10|ssc)\b",
    "12th": r"\b(12th|intermediate|hsc|class 12)\b",
    "UG":   r"\b(ug|degree|b\.?tech|bsc|bcom|college)\b",
    "PG":   r"\b(pg|masters|mtech|msc|mba)\b"
}

def guess_stage(text: str):
    t = text.lower()
    for stage, pat in STAGE_PATTERNS.items():
        if re.search(pat, t):
            return stage
    return None

def normalize(s: str):
    return re.sub(r"[^a-z0-9 ]", "", s.lower())

def match_career(query: str, stage: str, threshold=45):
    """
    Return best Career object if score >= threshold; else None.
    Uses fuzzy scoring on name + tags + example_queries.
    """
    qs = Career.objects.filter(stage=stage)
    best = None
    best_score = 0
    qnorm = normalize(query)
    for c in qs:
        corpus = " ".join([c.name] + c.tags + c.example_queries + [c.description])
        score = fuzz.token_set_ratio(qnorm, corpus)
        if score > best_score:
            best_score = score; best = c
    if best_score >= threshold:
        return best
    return None

def find_mentors_for_tags(tags, top_n=3):
    mentors = Mentor.objects.all()
    scored = []
    for m in mentors:
        overlap = len(set(m.tags) & set(tags))
        if overlap > 0:
            scored.append((overlap + (1 if m.available else 0), m))
    scored.sort(reverse=True, key=lambda x: x[0])
    return [{"name":m.name, "bio": m.bio, "contact": m.contact} for _, m in scored[:top_n]]
