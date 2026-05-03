"""
core/admin.py — Fully featured Django Admin for CareerPilot.

Access at: http://127.0.0.1:8000/admin/
"""

import json

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import AIRequest, User


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _truncate(text: str, length: int = 80) -> str:
    """Safely truncate long strings for list display."""
    return (text[:length] + "…") if len(text) > length else text


# ─────────────────────────────────────────────────────────────────────────────
# User Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Full-featured admin for the CareerPilot custom User model.
    Lists all key fields, allows search by name/email, and filters by role.
    """

    list_display  = ("id", "username", "email", "first_name", "last_name",
                     "is_staff", "is_active", "request_count", "date_joined")
    list_filter   = ("is_staff", "is_superuser", "is_active", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering      = ("-date_joined",)
    date_hierarchy = "date_joined"

    readonly_fields = ("date_joined", "last_login", "request_count")

    # Extra fieldsets on the detail view
    fieldsets = BaseUserAdmin.fieldsets + (
        ("CareerPilot Info", {"fields": ("request_count",)}),
    )

    @admin.display(description="# Requests")
    def request_count(self, obj):
        """Show how many AI requests this user has made."""
        count = obj.ai_requests.count()
        if count == 0:
            return "—"
        return format_html(
            '<span style="font-weight:600;color:#3b82f6">{}</span>',
            count,
        )


# ─────────────────────────────────────────────────────────────────────────────
# AI Request Admin
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(AIRequest)
class AIRequestAdmin(admin.ModelAdmin):
    """
    Rich admin for all AI requests — chat, resume, interview, career, roadmap.

    Features:
    - Colour-coded request_type badges
    - Truncated input/output preview columns
    - Date hierarchy drill-down
    - Full JSON ai_response rendered prettily
    - Search by username, email, or input text
    """

    list_display    = ("id", "user_link", "type_badge", "input_preview",
                       "output_preview", "created_at")
    list_filter     = ("request_type", "created_at")
    search_fields   = ("user__username", "user__email", "input_text", "output_text")
    ordering        = ("-created_at",)
    date_hierarchy  = "created_at"
    readonly_fields = ("created_at", "user", "request_type",
                       "input_text", "output_text", "pretty_json")
    # Hide raw ai_response in favour of our pretty version
    exclude         = ("ai_response",)

    # ── Custom columns ───────────────────────────────────────────────────────

    _TYPE_COLORS = {
        AIRequest.RequestType.RESUME:    ("#3b82f6", "#eff6ff"),   # blue
        AIRequest.RequestType.SUMMARY:   ("#8b5cf6", "#f5f3ff"),   # purple
        AIRequest.RequestType.INTERVIEW: ("#f97316", "#fff7ed"),   # orange
        AIRequest.RequestType.CAREER:    ("#ec4899", "#fdf2f8"),   # pink
    }

    @admin.display(description="User", ordering="user__username")
    def user_link(self, obj):
        return format_html(
            '<a href="/admin/core/user/{}/change/" style="font-weight:600">{}</a>',
            obj.user_id,
            obj.user.username,
        )

    @admin.display(description="Type")
    def type_badge(self, obj):
        color, bg = self._TYPE_COLORS.get(obj.request_type, ("#6b7280", "#f9fafb"))
        return format_html(
            '<span style="display:inline-block;padding:2px 10px;border-radius:20px;'
            'font-size:11px;font-weight:700;letter-spacing:.04em;'
            'color:{};background:{}">{}</span>',
            color, bg,
            obj.get_request_type_display().upper(),
        )

    @admin.display(description="Input")
    def input_preview(self, obj):
        return _truncate(obj.input_text, 90)

    @admin.display(description="Output")
    def output_preview(self, obj):
        return _truncate(obj.output_text, 90)

    @admin.display(description="AI Response (JSON)")
    def pretty_json(self, obj):
        """Renders the ai_response JSON dict as nicely formatted, syntax-highlighted HTML."""
        if not obj.ai_response:
            return "—"
        try:
            pretty = json.dumps(obj.ai_response, indent=2, ensure_ascii=False)
        except Exception:
            pretty = str(obj.ai_response)
        return mark_safe(
            f'<pre style="background:#1e1e2e;color:#cdd6f4;padding:16px;'
            f'border-radius:10px;font-size:12px;overflow-x:auto;'
            f'max-height:400px;">{pretty}</pre>'
        )

    def get_fieldsets(self, request, obj=None):
        if obj is None:
            return super().get_fieldsets(request, obj)
        return [
            ("Metadata", {
                "fields": ("user", "request_type", "created_at"),
            }),
            ("Input", {
                "fields": ("input_text",),
                "classes": ("wide",),
            }),
            ("Output", {
                "fields": ("output_text",),
                "classes": ("wide",),
            }),
            ("Structured AI Response", {
                "fields": ("pretty_json",),
            }),
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Admin site branding
# ─────────────────────────────────────────────────────────────────────────────

admin.site.site_header  = "CareerPilot Admin"
admin.site.site_title   = "CareerPilot"
admin.site.index_title  = "Database Management"
