"""
URL configuration for career_ai project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import (
    register_user, login_user,
    career_roadmap, career_skill_builder, career_jobs, career_mentors, user_profile, dashboard_metrics,
    trending_careers, roadmap_items, roadmap_item_detail, scrape_roadmap_sh,
)

urlpatterns = [
    path("auth/register/", register_user, name="register"),
    path("auth/login/", login_user, name="login"),
    path("user/me/", user_profile, name="user_profile"),
    path("dashboard/metrics/", dashboard_metrics, name="dashboard_metrics"),
    path("trending-careers", trending_careers, name="trending_careers"),
    path("career/roadmap/", career_roadmap, name="career_roadmap"),
    path("career/skill-builder/", career_skill_builder, name="career_skill_builder"),
    path("career/jobs/", career_jobs, name="career_jobs"),
    path("career/mentors/", career_mentors, name="career_mentors"),
    path("roadmap/items/", roadmap_items, name="roadmap_items"),
    path("roadmap/items/<int:item_id>/", roadmap_item_detail, name="roadmap_item_detail"),
    path("roadmap/scrape/", scrape_roadmap_sh, name="scrape_roadmap_sh"),
]
