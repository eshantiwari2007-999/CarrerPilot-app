"""
core/serializers.py — DRF serializers for user authentication.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AIRequest

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializes safe (non-sensitive) user fields for API responses."""

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")
        read_only_fields = fields


class SignupSerializer(serializers.ModelSerializer):
    """
    Handles user registration.
    - Validates that email is unique (model-level constraint + serializer check).
    - Hashes password before saving via create_user().
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Minimum 8 characters.",
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name")

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)


class AIRequestSerializer(serializers.ModelSerializer):
    """Serializer for AIRequest — used for creating and reading AI request logs."""

    user = serializers.StringRelatedField(read_only=True)  # returns user's __str__ (email)

    class Meta:
        model  = AIRequest
        fields = ("id", "user", "input_text", "output_text", "ai_response", "request_type", "created_at")
        read_only_fields = ("id", "user", "created_at")


class GenerateInputSerializer(serializers.Serializer):
    """Validates incoming data for POST /api/generate/."""

    input_text   = serializers.CharField(min_length=5)
    request_type = serializers.ChoiceField(choices=AIRequest.RequestType.choices)
