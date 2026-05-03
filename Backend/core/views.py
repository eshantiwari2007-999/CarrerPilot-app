"""
core/views.py — Authentication views for CareerPilot.
"""

import logging

from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .ai_service import (
    generate_ai_response,
    generate_from_prompt,
    generate_resume_ai,
    generate_interview_feedback_ai,
    generate_career_suggestions_ai,
    generate_roadmap_ai,
)
from .models import AIRequest
from .serializers import AIRequestSerializer, GenerateInputSerializer, SignupSerializer, UserSerializer

User = get_user_model()


# ─────────────────────────────────────────
# Public endpoints
# ─────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def test_endpoint(request: Request) -> Response:
    """GET /api/test/ — Quick connectivity check. Open in browser to verify server is up."""
    return Response({"status": "working"})


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request: Request) -> Response:
    """
    GET /api/health/
    Simple liveness probe.
    """
    return Response(
        {
            "status": "ok",
            "service": "CareerPilot API",
            "version": "1.0.0",
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request: Request) -> Response:
    """
    POST /api/signup/
    Register a new user and return an auth token.

    Request body:
        {
            "username": "johndoe",
            "email": "john@example.com",
            "password": "securepass123",
            "first_name": "John",   # optional
            "last_name": "Doe"      # optional
        }

    Response 201:
        {
            "token": "<auth_token>",
            "user": { id, username, email, first_name, last_name, date_joined }
        }
    """
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request: Request) -> Response:
    """
    POST /api/login/
    Authenticate an existing user and return their auth token.

    Request body (username OR email + password):
        {
            "username": "johndoe",
            "password": "securepass123"
        }

    Response 200:
        {
            "token": "<auth_token>",
            "user": { id, username, email, first_name, last_name, date_joined }
        }

    Response 400 on bad credentials:
        { "error": "Invalid credentials." }
    """
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "").strip()

    if not username or not password:
        return Response(
            {"error": "Both 'username' and 'password' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Support login by email as well
    if "@" in username:
        try:
            user_obj = User.objects.get(email__iexact=username)
            username = user_obj.username
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"error": "Invalid credentials."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


# ─────────────────────────────────────────
# Protected endpoints
# ─────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request: Request) -> Response:
    """
    GET /api/me/
    Returns the profile of the currently authenticated user.
    Requires: Authorization: Token <token>
    """
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request: Request) -> Response:
    """
    POST /api/logout/
    Invalidates the user's current auth token.
    Requires: Authorization: Token <token>
    """
    request.user.auth_token.delete()
    return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


# ── Test endpoints ───────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def signup_test(request: Request) -> Response:
    """
    GET /api/signup-test/
    Simple test endpoint to confirm signup API expects.
    """
    return Response({
        "message": "Signup API working. Use POST method to create user."
    })


# ─────────────────────────────────────────
# AI Generation endpoint
# ─────────────────────────────────────────

# Dummy responses removed — now powered by Gemini.

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate(request: Request) -> Response:
    """
    POST /api/generate/
    Send a prompt to Gemini and get an AI response.
    Requires: Authorization: Token <token>

    Accepts TWO modes:

    Mode 1 — Simple prompt (quickest):
        { "prompt": "Write a professional summary for a Python developer" }

        Response 200:
        { "response": "<Gemini text>" }

    Mode 2 — Structured career analysis:
        { "input_text": "<resume text>", "request_type": "resume" | "summary" }

        Response 201:
        { "id": ..., "ai_response": { "improved_summary": ..., "suggestions": [...], "skills": [...] } }
    """

    # ── Mode 1: simple prompt ─────────────────────────────────────────────────
    prompt = request.data.get("prompt", "").strip()
    context = request.data.get("context", {})
    if prompt:
        try:
            text = generate_from_prompt(prompt, context)
        except EnvironmentError:
            return Response(
                {"error": "AI service is not configured. Please contact support."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as exc:
            logger.exception("Gemini error: %s", exc)
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Save to DB with request_type="summary" as a sensible default
        AIRequest.objects.create(
            user=request.user,
            input_text=prompt,
            output_text=text,
            ai_response={"response": text},
            request_type=AIRequest.RequestType.SUMMARY,
        )

        return Response({"response": text}, status=status.HTTP_200_OK)

    # ── Mode 2: structured career analysis ───────────────────────────────────
    serializer = GenerateInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"errors": serializer.errors, "hint": "Send either 'prompt' or 'input_text' + 'request_type'"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    input_text   = serializer.validated_data["input_text"]
    request_type = serializer.validated_data["request_type"]

    try:
        ai_response = generate_ai_response(input_text, request_type)
    except EnvironmentError as exc:
        logger.error("Gemini config error: %s", exc)
        return Response(
            {"error": "AI service is not configured. Please contact support."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except ValueError as exc:
        logger.error("Gemini parse error: %s", exc)
        return Response(
            {"error": "AI service returned an unexpected response. Please try again."},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except Exception as exc:
        logger.exception("Unexpected Gemini error: %s", exc)
        return Response(
            {"error": "AI service is temporarily unavailable. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    ai_request = AIRequest.objects.create(
        user=request.user,
        input_text=input_text,
        output_text=ai_response.get("improved_summary", ""),
        ai_response=ai_response,
        request_type=request_type,
    )

    return Response(
        AIRequestSerializer(ai_request).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_resume(request: Request) -> Response:
    """POST /api/generate-resume/"""
    try:
        text = generate_resume_ai(request.data)
        
        AIRequest.objects.create(
            user=request.user,
            input_text=str(request.data),
            output_text=text,
            ai_response={"response": text},
            request_type=AIRequest.RequestType.RESUME,
        )
        return Response({"response": text}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("Error generating resume: %s", exc)
        return Response(
            {"error": "Failed to generate resume. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def interview_feedback(request: Request) -> Response:
    """POST /api/interview-feedback/"""
    question = request.data.get("question", "")
    answer = request.data.get("answer", "")
    role = request.data.get("role", "")
    
    try:
        text = generate_interview_feedback_ai(question, answer, role)
        
        AIRequest.objects.create(
            user=request.user,
            input_text=f"Q: {question}\nA: {answer}",
            output_text=text,
            ai_response={"response": text},
            request_type=AIRequest.RequestType.INTERVIEW,
        )
        return Response({"response": text}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("Error generating interview feedback: %s", exc)
        return Response(
            {"error": "Failed to generate interview feedback. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def career_suggestions(request: Request) -> Response:
    """POST /api/career-suggestions/"""
    try:
        text = generate_career_suggestions_ai(request.data)
        
        AIRequest.objects.create(
            user=request.user,
            input_text=str(request.data),
            output_text=text,
            ai_response={"response": text},
            request_type=AIRequest.RequestType.CAREER,
        )
        return Response({"response": text}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("Error generating career suggestions: %s", exc)
        return Response(
            {"error": "Failed to generate career suggestions. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_roadmap(request: Request) -> Response:
    """POST /api/generate-roadmap/"""
    try:
        text = generate_roadmap_ai(request.data)

        AIRequest.objects.create(
            user=request.user,
            input_text=str(request.data),
            output_text=text,
            ai_response={"response": text},
            request_type=AIRequest.RequestType.SUMMARY,
        )
        return Response({"response": text}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception("Error generating roadmap: %s", exc)
        return Response(
            {"error": "Failed to generate roadmap. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def history(request: Request) -> Response:
    """
    GET /api/history/
    Returns all AI requests made by the logged-in user, newest first.
    Requires: Authorization: Token <token>

    Response 200:
        [
            {
                "id": 3,
                "user": "john@example.com",
                "input_text": "...",
                "output_text": "...",
                "request_type": "resume",
                "created_at": "2026-04-29T..."
            },
            ...
        ]
    """
    requests_qs = AIRequest.objects.filter(user=request.user)  # ordering from model Meta
    serializer  = AIRequestSerializer(requests_qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
