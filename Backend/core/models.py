"""
core/models.py — Custom User model for CareerPilot.

Inheriting from AbstractUser gives us all standard Django auth fields
(username, email, password, is_active, etc.) and lets us add
CareerPilot-specific fields later without extra tables.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extended user model for CareerPilot.
    'email' is used as the natural identifier alongside username.
    """

    email = models.EmailField(unique=True)

    # — Future fields to add as the product grows —
    # bio = models.TextField(blank=True)
    # avatar_url = models.URLField(blank=True)
    # role = models.CharField(max_length=50, blank=True)  # e.g. "job_seeker", "recruiter"

    REQUIRED_FIELDS = ["email"]  # createsuperuser will also ask for email

    class Meta:
        db_table = "core_user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


class AIRequest(models.Model):
    """Stores every AI request made by a user (resume builder, summary, etc.)."""

    class RequestType(models.TextChoices):
        RESUME    = "resume",    "Resume"
        SUMMARY   = "summary",   "Summary"
        INTERVIEW = "interview", "Interview"
        CAREER    = "career",    "Career"

    user         = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ai_requests",
    )
    input_text   = models.TextField()
    output_text  = models.TextField(blank=True)   # raw Gemini text (kept for debugging)
    ai_response  = models.JSONField(default=dict, blank=True)  # structured: summary, suggestions, skills
    request_type = models.CharField(
        max_length=20,
        choices=RequestType.choices,
        default=RequestType.RESUME,
    )
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = "core_ai_request"
        ordering  = ["-created_at"]
        verbose_name = "AI Request"
        verbose_name_plural = "AI Requests"

    def __str__(self):
        return f"[{self.request_type}] {self.user.username} — {self.created_at:%Y-%m-%d %H:%M}"
