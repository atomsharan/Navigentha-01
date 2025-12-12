# chat/urls.py
from django.urls import path
from .views import chat_ask, ask_career, chat_post, chat_history

urlpatterns = [
    path("", chat_post, name="chat_post"),
    path("ask/", chat_ask, name="chat_ask"),
    path("ask_career/", ask_career, name="ask_career"),
    path("history/", chat_history, name="chat_history"),
]