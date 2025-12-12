# core/views_career_endpoints.py
from django.http import JsonResponse
from .models import Career  # or CareerPath depending on your model name
from django.apps import apps
from chat.utils.data_loader import load_dataset

def _find_career_by_name(name: str, dataset=None):
    nm = (name or "").strip().lower()
    if not nm:
        return None
    if dataset is None:
        dataset = load_dataset()
    for c in dataset:
        if c.get("name","").strip().lower() == nm:
            return c
    # fallback: partial match
    for c in dataset:
        if nm in c.get("name","").strip().lower():
            return c
    return None

def career_roadmap(request):
    career_name = request.GET.get("career","")
    c = _find_career_by_name(career_name)
    if not c:
        return JsonResponse({"error": "Career not found"}, status=404)
    return JsonResponse({"roadmap": c.get("future_paths", [])})

def career_skill_builder(request):
    career_name = request.GET.get("career","")
    c = _find_career_by_name(career_name)
    if not c:
        return JsonResponse({"error": "Career not found"}, status=404)
    return JsonResponse({"skills": c.get("skills", [])})

def career_jobs(request):
    career_name = request.GET.get("career","")
    c = _find_career_by_name(career_name)
    if not c:
        return JsonResponse({"error": "Career not found"}, status=404)
    return JsonResponse({"jobs": c.get("jobs", [])})

def career_mentors(request):
    career_name = request.GET.get("career","")
    c = _find_career_by_name(career_name)
    if not c:
        return JsonResponse({"error": "Career not found"}, status=404)
    return JsonResponse({"mentors": c.get("mentors", [])})
