# core/views.py
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from .models import Career, RoadmapItem
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import UserSerializer

def home(request):
    """A simple view for the root URL to confirm the API is running."""
    return JsonResponse({"message": "Welcome to the Career AI API. See /api/... for endpoints."})


def _get_career_data(request, field_name, json_key):
    """Helper to fetch a specific field from a career model instance."""
    career_name = request.GET.get("career", "")
    if not career_name:
        return JsonResponse({"error": "career parameter is required"}, status=400)
    try:
        career = Career.objects.get(name__iexact=career_name)
        return JsonResponse({json_key: getattr(career, field_name)})
    except Career.DoesNotExist:
        return JsonResponse({"error": "Career not found"}, status=404)


def trending_careers(request):
    """Public endpoint consumed by the frontend homepage.

    Returns a simple list of trending careers with the fields expected by
    the React page: id, title, growth, salary, and skills.
    """
    careers = [
        {
            "id": "1",
            "title": "Software Engineer", 
            "growth": 25, 
            "salary": "$80,000 - $150,000", 
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        },
        {
            "id": "2",
            "title": "Data Scientist", 
            "growth": 35, 
            "salary": "$90,000 - $160,000", 
            "skills": ["Python", "Machine Learning", "SQL", "Statistics"]
        },
        {
            "id": "3",
            "title": "Product Manager", 
            "growth": 20, 
            "salary": "$85,000 - $140,000", 
            "skills": ["Strategy", "Analytics", "Leadership", "Communication"]
        },
        {
            "id": "4",
            "title": "UX Designer", 
            "growth": 30, 
            "salary": "$70,000 - $120,000", 
            "skills": ["Figma", "User Research", "Prototyping", "Design Thinking"]
        },
        {
            "id": "5",
            "title": "DevOps Engineer", 
            "growth": 28, 
            "salary": "$85,000 - $145,000", 
            "skills": ["AWS", "Docker", "Kubernetes", "CI/CD"]
        },
        {
            "id": "6",
            "title": "AI/ML Engineer", 
            "growth": 40, 
            "salary": "$95,000 - $170,000", 
            "skills": ["TensorFlow", "PyTorch", "Python", "Deep Learning"]
        }
    ]
    return JsonResponse(careers, safe=False)


def career_skill_builder(request):
    """Return skills required for a career."""
    return _get_career_data(request, "skills", "skills")

def career_jobs(request):
    """Return jobs related to a career."""
    return _get_career_data(request, "jobs", "jobs")

def career_mentors(request):
    """Return mentor profiles for a career."""
    return _get_career_data(request, "mentors", "mentors")

def career_roadmap(request):
    """Return future paths (roadmap) for a career."""
    return _get_career_data(request, "future_paths", "roadmap")


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads((request.body or b"").decode() or "{}")
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return JsonResponse({"error": "username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)

    try:
        user = User.objects.create_user(username=username, password=password)
    except Exception as e:
        return JsonResponse({"error": f"Failed to create user: {e}"}, status=500)

    return JsonResponse({"message": "User registered successfully", "user_id": user.id})


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads((request.body or b"").decode() or "{}")
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return JsonResponse({"error": "username and password are required"}, status=400)

    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return JsonResponse({"message": "Login successful", "user_id": user.id})
    return JsonResponse({"error": "Invalid credentials"}, status=400)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    # Dummy data for now
    data = {
        'total_users': User.objects.count(),
        'total_careers': Career.objects.count(),
        'conversations_today': 15,
        'new_users_this_week': 5,
    }
    return Response(data)


# Roadmap API Endpoints
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Allow unauthenticated access, but prefer authenticated
def roadmap_items(request):
    """Get all roadmap items for the authenticated user or create a new one."""
    if request.method == 'GET':
        # If user is authenticated, return their items from database
        if request.user.is_authenticated:
            items = RoadmapItem.objects.filter(user=request.user)
            data = [{
                'id': str(item.id),
                'title': item.title,
                'description': item.description,
                'status': item.status,
                'priority': item.priority,
                'estimatedTime': item.estimated_time,
                'skills': item.skills,
                'resources': item.resources,
                'source': item.source,
                'stepNumber': item.step_number,
                'createdAt': item.created_at.isoformat(),
            } for item in items]
            return Response(data)
        else:
            # Return empty list for unauthenticated users (they'll use localStorage)
            return Response([])
    
    elif request.method == 'POST':
        # Only allow authenticated users to save to database
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required to save roadmap items'}, status=401)
        
        data = request.data
        # Get next step number if not provided
        step_number = data.get('stepNumber')
        if step_number is None:
            existing_items = RoadmapItem.objects.filter(user=request.user)
            step_number = existing_items.count() + 1
        
        item = RoadmapItem.objects.create(
            user=request.user,
            title=data.get('title', ''),
            description=data.get('description', ''),
            status=data.get('status', 'pending'),
            priority=data.get('priority', 'medium'),
            estimated_time=data.get('estimatedTime', ''),
            skills=data.get('skills', []),
            resources=data.get('resources', []),
            source=data.get('source', 'user-added'),
            step_number=step_number,
        )
        return Response({
            'id': str(item.id),
            'title': item.title,
            'description': item.description,
            'status': item.status,
            'priority': item.priority,
            'estimatedTime': item.estimated_time,
            'skills': item.skills,
            'resources': item.resources,
            'source': item.source,
            'stepNumber': item.step_number,
            'createdAt': item.created_at.isoformat(),
        }, status=201)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])  # Allow unauthenticated access for GET, but require auth for modifications
def roadmap_item_detail(request, item_id):
    """Get, update, or delete a specific roadmap item."""
    # #region agent log
    log_path = r'c:\Users\kamis\OneDrive\Desktop\career-ai\.cursor\debug.log'
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    log_entry = json.dumps({'location': 'core/views.py:243', 'message': 'roadmap_item_detail entry', 'data': {'item_id': item_id, 'method': request.method, 'has_auth_header': bool(auth_header), 'auth_header_prefix': auth_header[:30] if auth_header else 'none', 'user_id': request.user.id if hasattr(request.user, 'id') else None, 'is_authenticated': request.user.is_authenticated, 'user_type': str(type(request.user))}, 'timestamp': int(__import__('time').time() * 1000), 'sessionId': 'debug-session', 'runId': 'run1', 'hypothesisId': 'B'}) + '\n'
    with open(log_path, 'a', encoding='utf-8') as f: f.write(log_entry)
    # #endregion
    try:
        # For authenticated users, filter by user. For unauthenticated, allow any (they shouldn't access this anyway)
        if request.user.is_authenticated:
            item = RoadmapItem.objects.get(id=item_id, user=request.user)
        else:
            # Unauthenticated users shouldn't be able to modify items
            if request.method != 'GET':
                return Response({'error': 'Authentication required'}, status=401)
            item = RoadmapItem.objects.get(id=item_id)
    except RoadmapItem.DoesNotExist:
        return Response({'error': 'Roadmap item not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'id': str(item.id),
            'title': item.title,
            'description': item.description,
            'status': item.status,
            'priority': item.priority,
            'estimatedTime': item.estimated_time,
            'skills': item.skills,
            'resources': item.resources,
            'source': item.source,
            'createdAt': item.created_at.isoformat(),
        })
    
    elif request.method == 'PATCH':
        # #region agent log
        log_path = r'c:\Users\kamis\OneDrive\Desktop\career-ai\.cursor\debug.log'
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        log_entry = json.dumps({'location': 'core/views.py:271', 'message': 'PATCH method - auth check', 'data': {'item_id': item_id, 'is_authenticated': request.user.is_authenticated, 'user_id': request.user.id if hasattr(request.user, 'id') else None, 'has_auth_header': bool(auth_header), 'auth_header_prefix': auth_header[:30] if auth_header else 'none'}, 'timestamp': int(__import__('time').time() * 1000), 'sessionId': 'debug-session', 'runId': 'run1', 'hypothesisId': 'B'}) + '\n'
        with open(log_path, 'a', encoding='utf-8') as f: f.write(log_entry)
        # #endregion
        if not request.user.is_authenticated:
            # #region agent log
            log_entry = json.dumps({'location': 'core/views.py:272', 'message': 'Returning 401 - not authenticated', 'data': {'item_id': item_id, 'auth_header': auth_header[:50] if auth_header else 'none'}, 'timestamp': int(__import__('time').time() * 1000), 'sessionId': 'debug-session', 'runId': 'run1', 'hypothesisId': 'B'}) + '\n'
            with open(log_path, 'a', encoding='utf-8') as f: f.write(log_entry)
            # #endregion
            return Response({'error': 'Authentication required'}, status=401)
        
        data = request.data
        if 'title' in data:
            item.title = data['title']
        if 'description' in data:
            item.description = data['description']
        if 'status' in data:
            item.status = data['status']
        if 'priority' in data:
            item.priority = data['priority']
        if 'estimatedTime' in data:
            item.estimated_time = data['estimatedTime']
        if 'skills' in data:
            item.skills = data['skills']
        if 'resources' in data:
            item.resources = data['resources']
        if 'stepNumber' in data:
            item.step_number = data['stepNumber']
        item.save()
        return Response({
            'id': str(item.id),
            'title': item.title,
            'description': item.description,
            'status': item.status,
            'priority': item.priority,
            'estimatedTime': item.estimated_time,
            'skills': item.skills,
            'resources': item.resources,
            'source': item.source,
            'stepNumber': item.step_number,
            'createdAt': item.created_at.isoformat(),
        })
    
    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        item.delete()
        return Response({'message': 'Roadmap item deleted'}, status=204)


@api_view(['POST'])
@permission_classes([AllowAny])
def scrape_roadmap_sh(request):
    """Scrape roadmap from roadmap.sh and return structured roadmap items."""
    try:
        data = request.data
        roadmap_url = data.get('url', '').strip()
        
        if not roadmap_url:
            return Response({'error': 'URL is required'}, status=400)
        
        # Validate roadmap.sh URL
        if 'roadmap.sh' not in roadmap_url:
            return Response({'error': 'Invalid roadmap.sh URL'}, status=400)
        
        # Fetch the webpage
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(roadmap_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract roadmap title
        title_elem = soup.find('h1') or soup.find('title')
        roadmap_title = title_elem.get_text().strip() if title_elem else 'Roadmap from roadmap.sh'
        
        # Find roadmap items - roadmap.sh typically uses specific classes/structures
        roadmap_items = []
        
        # Try to find roadmap steps/items - common patterns in roadmap.sh
        # Pattern 1: Look for ordered lists or divs with roadmap content
        steps = soup.find_all(['li', 'div'], class_=re.compile(r'step|roadmap|item|milestone', re.I))
        
        # Pattern 2: Look for headings followed by content
        headings = soup.find_all(['h2', 'h3', 'h4'])
        
        # Pattern 3: Look for specific roadmap.sh structure
        roadmap_content = soup.find('div', class_=re.compile(r'roadmap|content|steps', re.I))
        
        if roadmap_content:
            # Extract items from roadmap content area
            items = roadmap_content.find_all(['li', 'div'], recursive=True)
            for idx, item in enumerate(items[:20], 1):  # Limit to 20 items
                text = item.get_text(strip=True)
                if text and len(text) > 10:  # Filter out very short items
                    # Extract links
                    links = item.find_all('a', href=True)
                    resources = []
                    for link in links:
                        href = link.get('href', '')
                        link_text = link.get_text(strip=True)
                        if href:
                            # Make absolute URL
                            if href.startswith('/'):
                                href = urljoin(roadmap_url, href)
                            elif not href.startswith('http'):
                                href = urljoin(roadmap_url, href)
                            resources.append({'name': link_text or href, 'url': href})
                    
                    roadmap_items.append({
                        'title': text[:100],  # Limit title length
                        'description': text[:500] if len(text) > 100 else text,
                        'status': 'pending',
                        'priority': 'medium',
                        'estimatedTime': '',
                        'skills': [],
                        'resources': resources[:5],  # Limit to 5 resources per item
                        'source': 'roadmap-sh',
                        'stepNumber': idx
                    })
        
        # If no items found with pattern 3, try headings approach
        if not roadmap_items and headings:
            for idx, heading in enumerate(headings[:15], 1):
                text = heading.get_text(strip=True)
                if text and len(text) > 5:
                    # Get next sibling content
                    next_elem = heading.find_next_sibling()
                    description = ''
                    if next_elem:
                        description = next_elem.get_text(strip=True)[:500]
                    
                    # Find links near this heading
                    resources = []
                    for link in heading.find_all_next('a', href=True, limit=3):
                        href = link.get('href', '')
                        if href:
                            if href.startswith('/'):
                                href = urljoin(roadmap_url, href)
                            elif not href.startswith('http'):
                                href = urljoin(roadmap_url, href)
                            resources.append({'name': link.get_text(strip=True) or href, 'url': href})
                    
                    roadmap_items.append({
                        'title': text[:100],
                        'description': description or text[:200],
                        'status': 'pending',
                        'priority': 'medium',
                        'estimatedTime': '',
                        'skills': [],
                        'resources': resources[:5],
                        'source': 'roadmap-sh',
                        'stepNumber': idx
                    })
        
        # Fallback: Extract any meaningful content
        if not roadmap_items:
            # Get main content
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'main|content', re.I))
            if main_content:
                paragraphs = main_content.find_all(['p', 'li'], limit=10)
                for idx, para in enumerate(paragraphs, 1):
                    text = para.get_text(strip=True)
                    if text and len(text) > 20:
                        roadmap_items.append({
                            'title': f'Step {idx}',
                            'description': text[:500],
                            'status': 'pending',
                            'priority': 'medium',
                            'estimatedTime': '',
                            'skills': [],
                            'resources': [],
                            'source': 'roadmap-sh',
                            'stepNumber': idx
                        })
        
        if not roadmap_items:
            return Response({
                'error': 'Could not extract roadmap items from the page',
                'title': roadmap_title,
                'url': roadmap_url
            }, status=400)
        
        return Response({
            'title': roadmap_title,
            'url': roadmap_url,
            'items': roadmap_items,
            'count': len(roadmap_items)
        })
        
    except requests.RequestException as e:
        return Response({'error': f'Failed to fetch URL: {str(e)}'}, status=400)
    except Exception as e:
        return Response({'error': f'Error scraping roadmap: {str(e)}'}, status=500)
