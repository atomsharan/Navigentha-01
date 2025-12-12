from django.db import models
from django.contrib.auth.models import User

# core/models.py
from django.db import models

class Career(models.Model):
    STAGES = [("10th","10th"),("12th","12th"),("UG","UG"),("PG","PG")]
    stage = models.CharField(max_length=8, choices=STAGES, default="UG")
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    salary_range = models.CharField(max_length=64, blank=True)
    skills = models.JSONField(default=list, blank=True)
    specialties = models.JSONField(default=list, blank=True)   # list of dicts
    future_paths = models.JSONField(default=list, blank=True)
    jobs = models.JSONField(default=list, blank=True)
    mentors = models.JSONField(default=list, blank=True)
    lecture_platforms = models.JSONField(default=list, blank=True)
    example_queries = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)  # keywords/synonyms
    mentor_templates = models.JSONField(default=dict, blank=True)
    intelligence_layer = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.name} ({self.stage})"


class ConversationSession(models.Model):
    # Change id to a string primary key
    id = models.CharField(primary_key=True, max_length=50)  
    stage = models.CharField(max_length=20, blank=True, null=True)
    awaiting_specialty = models.BooleanField(default=False)
    selected_career = models.ForeignKey(
        'Career', blank=True, null=True, on_delete=models.SET_NULL
    )
    last_user_message = models.TextField(blank=True, null=True)
    last_bot_message = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)


class MessageLog(models.Model):
    session = models.ForeignKey(ConversationSession, on_delete=models.CASCADE)
    role = models.CharField(max_length=10)  # 'user' | 'bot'
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


from django.db import models

class Mentor(models.Model):
    name = models.CharField(max_length=200)
    expertise = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)  # e.g. ["AI", "Math"]
    contact = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.name

class UserPreference(models.Model):
    THEME_CHOICES = (
        ('light', 'Light'),
        ('dark', 'Dark'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    notifications_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Preferences"


class RoadmapItem(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    SOURCE_CHOICES = [
        ('ai-generated', 'AI Generated'),
        ('user-added', 'User Added'),
        ('roadmap-sh', 'Roadmap.sh'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmap_items')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    estimated_time = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list, blank=True)
    resources = models.JSONField(default=list, blank=True)  # Can store strings or objects with {name, url}
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='user-added')
    step_number = models.IntegerField(default=0, blank=True)  # For step-by-step ordering
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.user.username})"