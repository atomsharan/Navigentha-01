from django.urls import path
from . import views

urlpatterns = [
    path('chat/ask', views.ask_chatbot, name='ask_chatbot'),
    path('career/roadmap/', views.career_roadmap, name='career_roadmap'),
    path('chatbot/assessment', views.assessment, name='chatbot_assessment'),
]
