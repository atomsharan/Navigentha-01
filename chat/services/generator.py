# chat/services/generator.py
import os, json
import openai

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_KEY:
    openai.api_key = OPENAI_KEY

def simple_career_card(career):
    return {
        "type": "career",
        "career": {
            "name": career.name,
            "description": career.description,
            "skills": career.skills,
            "salary_range": career.salary_range,
            "future_paths": career.future_paths,
            "jobs": career.jobs,
            "lecture_platforms": career.lecture_platforms,
            "specialties": career.specialties
        }
    }

def ai_fallback_reply(user_text, retrieved_examples=None, stage=None):
    # Safe fallback if no OpenAI key
    if not OPENAI_KEY:
        if retrieved_examples:
            return f"Based on similar entries: {', '.join([r.get('name','') for r in retrieved_examples[:3]])}. Tell me if you want details."
        return "I didn't find exact match. Tell me more about your interests or stage."

    # Build compact prompt
    context = ""
    if retrieved_examples:
        for r in retrieved_examples[:3]:
            context += f"- {r.get('name')} : {r.get('description','')[:120]}\n"
    prompt = (
        f"You are a helpful career advisor. The user said: '{user_text}'. "
        f"Context: {context}\nReturn a short JSON: {{'best_match':'', 'why':'', 'suggested':['...'], 'next_step':''}}"
    )
    resp = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"system","content":"You are a concise career guide."},
                  {"role":"user","content":prompt}],
        temperature=0.2,
        max_tokens=220
    )
    txt = resp["choices"][0]["message"]["content"].strip()
    # try to extract JSON; if fail, return raw text
    try:
        # find first { and parse
        json_text = txt[txt.index("{"):]
        return json.loads(json_text)
    except Exception:
        return {"text": txt}
