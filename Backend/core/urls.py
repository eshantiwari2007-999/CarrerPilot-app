"""
core/urls.py — URL patterns for the core app.
"""

from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse

from .views import (
    generate, generate_resume, interview_feedback, career_suggestions, generate_roadmap,
    health_check, history, login, logout, me, signup, signup_test, test_endpoint
)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    CareerPilot API — root endpoint listing all available routes.
    Browsable at http://127.0.0.1:8000/api/
    """
    return Response({
        "info":      "CareerPilot AI Backend API",
        "version":   "1.0.0",
        "endpoints": {
            "health":            reverse("core:health-check",        request=request),
            "signup":            reverse("core:signup",              request=request),
            "login":             reverse("core:login",               request=request),
            "logout":            reverse("core:logout",              request=request),
            "me":                reverse("core:me",                  request=request),
            "history":           reverse("core:history",             request=request),
            "generate_chat":     reverse("core:generate",            request=request),
            "generate_resume":   reverse("core:generate-resume",     request=request),
            "interview_feedback":reverse("core:interview-feedback",  request=request),
            "career_suggestions":reverse("core:career-suggestions",  request=request),
            "generate_roadmap":  reverse("core:generate-roadmap",    request=request),
        },
    })

app_name = "core"

urlpatterns = [
    # ── API Root (browsable) ─────────────────────
    path("",            api_root,    name="api-root"),

    # ── DRF Browser Auth (login/logout for browsable API) ──
    path("auth/",       include("rest_framework.urls", namespace="rest_framework")),

    # ── Test ────────────────────────────────
    path("signup-test/", signup_test, name="signup-test"),

    # ── Public ──────────────────────────────
    path("test/",    test_endpoint, name="test"),
    path("health/",  health_check,  name="health-check"),
    path("signup/",  signup,        name="signup"),
    path("login/",   login,         name="login"),

    # ── Protected (requires Token) ─────────────────
    path("me/",       me,           name="me"),
    path("logout/",   logout,       name="logout"),
    path("history/",  history,      name="history"),

    # ── AI Features ────────────────────────────
    path("generate/",             generate,             name="generate"),
    path("generate-resume/",      generate_resume,      name="generate-resume"),
    path("interview-feedback/",   interview_feedback,   name="interview-feedback"),
    path("career-suggestions/",   career_suggestions,   name="career-suggestions"),
    path("generate-roadmap/",     generate_roadmap,     name="generate-roadmap"),
]