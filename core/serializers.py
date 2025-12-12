from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserPreference

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ('theme', 'notifications_enabled')