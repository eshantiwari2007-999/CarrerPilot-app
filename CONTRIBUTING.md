# Contributing to CareerPilot

Thank you for your interest in contributing to CareerPilot! 🎉

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and more.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We're all here to build something great together.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. Set up both the [Frontend](README.md#frontend-setup) and [Backend](README.md#backend-setup) following the README

---

## Development Setup

Follow the full setup guide in the [README.md](README.md#-getting-started).

Key things to know:
- Backend runs on `http://127.0.0.1:8000`
- Frontend runs on `http://localhost:5173`
- Set `VITE_API_URL=http://127.0.0.1:8000/api/` in your frontend `.env.local`

---

## Making Changes

### Branch Naming

Use a descriptive branch name following this format:

```
<type>/<short-description>
```

**Types:**
- `feat/` — New feature
- `fix/` — Bug fix
- `docs/` — Documentation only
- `chore/` — Maintenance, dependencies, config
- `refactor/` — Code restructuring (no feature change)
- `test/` — Adding or updating tests

**Examples:**
```
feat/oauth-google-login
fix/history-endpoint-pagination
docs/update-api-docs
```

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(optional scope): <short description>
```

**Examples:**
```
feat(auth): add Google OAuth login flow
fix(api): handle empty prompt in /generate/ endpoint
docs: add deployment guide for Railway
chore(deps): upgrade Django to 5.2.1
refactor(ai): extract Gemini client into singleton helper
```

**Rules:**
- Use present tense: `add feature` not `added feature`
- Keep the first line under 72 characters
- Reference issues: `fix: resolve #42 — token not cleared on logout`

---

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Test your changes locally (frontend + backend)
3. Make sure no `.env` files, API keys, or secrets are included
4. Fill out the PR template with a clear description of what changed and why
5. Link any related issues (`Closes #123`)
6. Wait for a review — we aim to respond within 48 hours

---

## Reporting Bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) issue template.

Please include:
- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS version (for frontend issues)
- Django version and Python version (for backend issues)
- Any relevant error messages or logs

---

## Feature Requests

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) issue template.

---

## Questions?

Open a [GitHub Discussion](https://github.com/eshantiwari2007-999/CarrerPilot-app/discussions) or reach out via the contact info in the README.

Happy coding! 🚀
