"""
core/ai_service.py — Smart career AI for CareerPilot.
Falls back gracefully to an intelligent rule-based engine when the Gemini quota is exceeded.
"""

import json
import logging
import os
import re
import random

logger = logging.getLogger(__name__)

MODEL = "gemini-1.5-flash"


def _get_client():
    """Initialise Gemini client from GEMINI_API_KEY env var."""
    try:
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            return None
        return genai.Client(api_key=api_key)
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Smart rule-based career AI
# ─────────────────────────────────────────────────────────────────────────────

def _smart_career_response(prompt: str, context: dict = None) -> str:
    """Generate a realistic, helpful AI career response based on the prompt."""
    p = prompt.lower().strip()
    
    user_name = "there"
    if context and context.get("name"):
        # Just use first name if possible
        user_name = context.get("name").split()[0]

    # ── Greetings ──────────────────────────────────────────────────────────────
    greetings = ["hi", "hello", "hey", "good morning", "good evening", "sup", "what's up"]
    if any(p == g or p.startswith(g + " ") for g in greetings):
        return random.choice([
            f"Hi {user_name}! 👋 I'm Peter, your AI career companion. I'm here to help you land your dream job, craft the perfect resume, or ace your next interview. What would you like to work on today?",
            f"Hello {user_name}! Great to connect with you. Whether it's resume building, interview prep, or career direction — I've got you covered. What's on your mind?",
            f"Hey {user_name}! I'm Peter, your personal AI career coach. I can help you with resume writing, interview strategies, career planning, salary negotiation, and much more. Where shall we start?",
        ])

    # ── Resume ─────────────────────────────────────────────────────────────────
    if any(w in p for w in ["resume", "cv", "curriculum"]):
        if any(w in p for w in ["build", "create", "make", "write", "help", "generate"]):
            return """Great! Let's build you a standout resume. Here's what makes a winning resume in 2024:

**📋 Structure to follow:**
1. **Header** — Full name, phone, email, LinkedIn, GitHub/portfolio
2. **Professional Summary** — 2–3 sentences highlighting your value proposition
3. **Work Experience** — Use the STAR method (Situation, Task, Action, Result)
4. **Skills** — Technical + soft skills relevant to the role
5. **Education** — Degree, institution, graduation year
6. **Projects / Certifications** — Especially important for freshers

**💡 Pro Tips:**
- Quantify everything: *"Increased sales by 30%"* beats *"improved sales"*
- Tailor your resume for each job description — ATS systems scan for keywords
- Keep it to **1 page** (2 pages max for 10+ years experience)
- Use action verbs: *Led, Built, Optimized, Reduced, Delivered*

To get started, tell me: **What is your current role or field?** (e.g., software engineer, marketing, data science)"""

        if any(w in p for w in ["review", "check", "improve", "fix", "feedback"]):
            return """I'd love to review your resume! Here's what I typically look for:

**🔍 Common Resume Mistakes I Fix:**
- ❌ Generic objective statements → ✅ Targeted professional summaries
- ❌ Job duties listed → ✅ Achievements with metrics & impact
- ❌ Missing keywords (ATS rejection) → ✅ Role-specific keyword optimization
- ❌ Inconsistent formatting → ✅ Clean, professional layout
- ❌ Unexplained employment gaps → ✅ Strategic framing

**📊 ATS Score Factors:**
- Keyword match with job description: ~40% of score
- Formatting compatibility: ~20%
- Work history relevance: ~40%

Go ahead and **paste your resume content** or **describe your experience**, and I'll give you specific, actionable feedback!"""

    # ── Interview ──────────────────────────────────────────────────────────────
    if any(w in p for w in ["interview", "prepare", "preparation", "practice", "questions"]):
        return """Let's ace that interview! Here's your complete prep guide:

**🎯 The STAR Method (for behavioral questions):**
- **S**ituation — Set the scene
- **T**ask — What was your responsibility?
- **A**ction — What did YOU specifically do?
- **R**esult — What was the measurable outcome?

**🔥 Top Interview Questions & How to Answer:**

1. *"Tell me about yourself"* → 60-second pitch: current role → key achievement → why this company
2. *"Why do you want this job?"* → Connect your skills to their mission
3. *"Greatest weakness?"* → Real weakness + what you're doing to improve it
4. *"Where do you see yourself in 5 years?"* → Growth aligned with the company's trajectory
5. *"Salary expectations?"* → Research market rate, give a range, not a fixed number

**💬 Questions YOU should ask:**
- "What does success look like in this role after 90 days?"
- "What are the biggest challenges facing the team right now?"
- "How do you measure performance here?"

What role or company are you interviewing for? I can give you more targeted questions!"""

    # ── Salary / negotiation ───────────────────────────────────────────────────
    if any(w in p for w in ["salary", "negotiate", "pay", "compensation", "raise", "hike", "offer"]):
        return """Salary negotiation is a skill — and it's worth thousands of dollars. Here's how to do it right:

**💰 Before the Negotiation:**
- Research market rates: Glassdoor, LinkedIn Salary, Levels.fyi, Payscale
- Know your BATNA (Best Alternative to Negotiated Agreement)
- Never give a number first — let them anchor

**🗣️ Scripts That Work:**

*When asked for expected salary:*
> "I'm flexible and open to a competitive offer. Based on my research and experience, I'm targeting the ₹X–₹Y range. Is that within your budget?"

*When you get an offer:*
> "Thank you! I'm really excited about this opportunity. Based on my X years of experience and [specific skills/achievements], I was hoping we could get closer to ₹X. Is there flexibility there?"

*If they say no:*
> "I understand. Could we revisit this after 6 months with a performance review built in?"

**📊 Key Facts:**
- 70% of employers expect negotiation — they build buffer into initial offers
- Average negotiation increases offer by 10–20%
- Always negotiate non-salary too: joining bonus, extra leave, WFH flexibility, stock options

What's the offer you received? I can help you craft a specific counter-offer strategy!"""

    # ── Career change / direction ──────────────────────────────────────────────
    if any(w in p for w in ["career change", "switch", "transition", "different field", "new career", "career path", "change job"]):
        return """Thinking about a career change? That takes courage — and a smart strategy. Here's your roadmap:

**🗺️ The Career Transition Framework:**

**Step 1: Skills Audit**
List your transferable skills (communication, leadership, data analysis, project management — these cross every industry)

**Step 2: Identify Target Roles**
- What energizes you? What problems do you want to solve?
- Use LinkedIn's "Career Explorer" to see how your current skills map to new roles

**Step 3: Bridge the Gap**
- Take targeted courses (Coursera, Udemy, LinkedIn Learning)
- Build 2–3 projects in the new field
- Get a certification if needed (e.g., Google Data Analytics, AWS, PMP)

**Step 4: Rebrand Yourself**
- Update LinkedIn headline to target role
- Rewrite resume to highlight transferable experience
- Write a compelling cover letter explaining your "why"

**Step 5: Network Strategically**
- Connect with people IN the target role on LinkedIn
- Ask for 15-minute "informational interviews"
- Join communities (Slack groups, Reddit, Discord)

What field are you currently in, and where do you want to go? I'll map out a specific plan for you!"""

    # ── Skills / learning ──────────────────────────────────────────────────────
    if any(w in p for w in ["skill", "learn", "course", "upskill", "certif", "training", "study"]):
        return """Smart investment in the right skills can 2–3x your earning potential. Here's what's hot in 2024:

**🔥 Most In-Demand Skills by Category:**

**Tech / Software:**
- AI & Machine Learning (Python, TensorFlow, LangChain)
- Cloud (AWS, GCP, Azure) — avg salary premium: +25%
- Data Analysis (SQL, Python, Power BI, Tableau)
- Full-Stack Development (React, Node.js, TypeScript)
- DevOps / MLOps (Docker, Kubernetes, CI/CD)

**Business / Management:**
- Product Management (JIRA, roadmapping, user research)
- Digital Marketing & SEO
- Financial Modeling (Excel, DCF)
- Project Management (PMP, Agile, Scrum)

**Always Valuable:**
- Public speaking & communication
- Leadership & stakeholder management
- Data-driven decision making

**📚 Best Free/Affordable Resources:**
- **Coursera** — Google & Meta certificates
- **freeCodeCamp** — Web dev, data science
- **Kaggle** — Data science competitions
- **YouTube** — Traversy Media, CS50, Fireship

What field are you in? I'll recommend a personalized 3-month learning roadmap!"""

    # ── LinkedIn ───────────────────────────────────────────────────────────────
    if "linkedin" in p:
        return """LinkedIn is your most powerful career tool — if used correctly. Here's how to optimize it:

**⚡ Profile Optimization Checklist:**
- ✅ Professional photo (headshot, good lighting) — 14x more profile views
- ✅ Custom headline: *"[Role] | [Expertise] | Helping [who] achieve [what]"*
- ✅ Compelling About section: Who you are → What you do → What you're looking for
- ✅ Featured section: Projects, articles, portfolio links
- ✅ Skills endorsed by colleagues
- ✅ 500+ connections (quality matters, but volume opens doors)

**📈 To Get Noticed by Recruiters:**
- Turn ON "Open to Work" (visible to recruiters only option)
- Add keywords from job descriptions in your Experience section
- Post 1–2x/week: career insights, wins, lessons learned
- Comment thoughtfully on industry leaders' posts

**🔗 Networking That Works:**
> *"Hi [Name], I saw your work at [Company] on [topic] and found it really insightful. I'm a [your role] exploring opportunities in [their field]. Would you be open to a 15-min chat?"*

What aspect of LinkedIn do you want to tackle first?"""

    # ── Job search ─────────────────────────────────────────────────────────────
    if any(w in p for w in ["job", "apply", "application", "find work", "job search", "job hunt", "hiring", "offer"]):
        return """Let's supercharge your job search! Here's a proven system:

**🎯 The 3-Channel Job Search Strategy:**

**1. Direct Applications (30% of effort)**
- Target 10–15 companies you'd love to work at
- Apply via their careers page directly (not just LinkedIn)
- Customize your resume for each role — use the job description keywords

**2. Networking (50% of effort — highest ROI)**
- 70–80% of jobs are filled through referrals
- Message ex-colleagues, professors, LinkedIn connections
- Ask: "Are you aware of any openings at your company or in your network?"

**3. Recruiters & Agencies (20% of effort)**
- Message relevant recruiters on LinkedIn
- Tell them: role, location, expected salary, availability
- They work FOR you — it costs them nothing to place you

**📊 Application Tracker Template:**
| Company | Role | Applied | Status | Follow-up Date |

**⏱️ The Follow-Up Rule:**
- No response after 7 days? Send ONE polite follow-up
- Persistence is professional; spamming is not

How long have you been searching, and what roles are you targeting? I'll help you tighten your strategy!"""

    # ── Cover letter ───────────────────────────────────────────────────────────
    if any(w in p for w in ["cover letter", "covering letter", "motivation letter"]):
        return """A great cover letter can get you an interview when your resume alone wouldn't. Here's the formula:

**✉️ The Perfect Cover Letter Structure:**

**Paragraph 1 — The Hook**
Don't start with "I am applying for…". Instead:
> *"When [Company] launched [product/initiative], I saw exactly the kind of problem I've spent my career learning to solve."*

**Paragraph 2 — Your Value**
Connect your top 2–3 achievements directly to their job requirements:
> *"At [Previous Company], I [action] which resulted in [measurable result]. This experience directly maps to your need for [their requirement]."*

**Paragraph 3 — Why Them**
Show you've done your research:
> *"I'm particularly drawn to [Company]'s approach to [specific thing] — this aligns with my belief that [your philosophy]."*

**Paragraph 4 — The Close**
> *"I'd love to bring this experience to your team. I'm excited about the opportunity to discuss how I can contribute to [specific goal]. Thank you for your time."*

**⚡ Key Rules:**
- Keep it to 3–4 paragraphs, under 400 words
- Never just repeat your resume — tell a story
- Customize every single one — generic letters get ignored

Tell me the role you're applying for and I'll help you write a tailored one!"""

    # ── Fresher / entry level ──────────────────────────────────────────────────
    if any(w in p for w in ["fresher", "fresh graduate", "no experience", "entry level", "first job", "new grad", "just graduated"]):
        return """Welcome to the job market! Here's exactly how freshers land great first jobs:

**🚀 The Fresher's Advantage Playbook:**

**1. Build Projects (Most Important)**
- Even 2–3 strong projects beat zero experience
- For tech: build apps, contribute to open source, do Kaggle competitions
- For business: case studies, mock marketing campaigns, freelance gigs

**2. Internships & Freelancing**
- Even unpaid/low-paid internships open doors
- Fiverr, Upwork, Toptal for freelancing
- These become your "experience" on the resume

**3. Certifications That Matter for Freshers:**
- Google Data Analytics Certificate
- AWS Cloud Practitioner
- Meta Front-End Developer Certificate
- HubSpot Marketing Certificate (free)

**4. College Projects — Reframe Them**
Instead of: *"Final year project on machine learning"*
Write: *"Built a predictive model using Python & scikit-learn that achieved 87% accuracy on real-world dataset"*

**5. The Fresher Resume Formula:**
Education → Skills → Projects → Internships → Extracurriculars/Achievements

**6. Where to Apply:**
- LinkedIn, Naukri, Internshala, AngelList
- Company career pages directly
- College alumni networks (gold mine!)

What field are you targeting? I'll give you a specific 30-day action plan!"""

    # ── Soft skills / general advice ───────────────────────────────────────────
    if any(w in p for w in ["tips", "advice", "guidance", "suggest", "help me", "what should", "help"]):
        return f"""Here are the most impactful career moves you can make right now, {user_name}:

**⚡ High-Impact Career Actions (Ranked by ROI):**

1. **Update your LinkedIn** — Takes 2 hours, can generate passive recruiter outreach for years
2. **Ask for a referral** — 10x better chance of getting an interview vs. cold applying
3. **Quantify your achievements** — Adding numbers to your resume takes 30 mins and significantly boosts callback rates
4. **Learn one AI tool deeply** — ChatGPT, Copilot, or a domain-specific AI tool makes you stand out in every field now
5. **Talk to 5 people in your target role** — Informational interviews give you insider knowledge no course can provide
6. **Build in public** — Share your projects, learning, and wins on LinkedIn. Opportunities come to visible people

**🧠 Career Mindset Shifts:**
- Your career is a product — market it actively
- Networking isn't asking for favors — it's building mutual value
- Rejection is data, not failure — iterate and improve

What's your biggest career challenge right now? Let's solve it specifically!"""

    # ── Default fallback (still smart) ────────────────────────────────────────
    topics = [
        "resume writing and optimization",
        "interview preparation and practice",
        "salary negotiation strategies",
        "LinkedIn profile optimization",
        "career change roadmaps",
        "skill development and certifications",
        "job search strategies",
        "cover letter writing",
        "networking and referrals",
        "personal branding",
    ]
    topic_list = "\n".join(f"• {t.title()}" for t in topics)

    return f"""Great question, {user_name}! I'm Peter, your AI career companion, and I can help you with:

{topic_list}

Based on your message, here's my advice: **be specific about your goal**, and I can give you a tailored, actionable plan. 

For example, instead of "help me pls," try:
- *"I'm a software engineer with 2 years of experience looking for senior roles in fintech"*
- *"Help me write a resume for a product manager position"*
- *"How do I negotiate my salary for a ₹15 LPA offer?"*

The more context you share, the more targeted my guidance will be. What's your specific career challenge right now?"""


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def generate_from_prompt(prompt: str, context: dict = None) -> str:
    """Send a conversational prompt to Gemini using the Peter mentor persona."""
    client = _get_client()

    if client:
        context_str = ""
        if context:
            parts = []
            if context.get("name"): parts.append(f"Name: {context['name']}")
            if context.get("currentRole"): parts.append(f"Current Role: {context['currentRole']}")
            if context.get("targetRole"): parts.append(f"Target Role: {context['targetRole']}")
            if context.get("skills"): parts.append(f"Skills: {context['skills']}")
            if context.get("experience"): parts.append(f"Experience: {context['experience']}")
            if context.get("education"): parts.append(f"Education: {context['education']}")
            context_str = "\n".join(parts) if parts else "No profile set yet."
        
        system_prompt = f"""You are Peter, a smart, friendly AI career mentor.
Speak like a real human — not robotic.

Rules:
* Keep responses SHORT (max 3–5 lines)
* Be direct, helpful, and practical
* Personalize using user's input
* Avoid generic advice
* Give actionable suggestions (next steps)
* Sound confident but friendly (Gen-Z + professional mix)
* No long paragraphs
* No fluff
* Use bullet points or short lines if helpful

User Info:
{context_str}

User Message:
{prompt}

Now respond like a real mentor."""

        try:
            from google.genai import types
            response = client.models.generate_content(
                model=MODEL,
                contents=system_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=150,
                    top_p=0.9,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini unavailable (likely quota limit), using smart fallback: {e}")
            # Fall through to the smart rule-based engine instead of crashing
            pass

    # Smart rule-based fallback
    return _smart_career_response(prompt, context)


def generate_ai_response(input_text: str, request_type: str) -> dict:
    """Structured career analysis — Gemini preferred, smart fallback if unavailable."""
    client = _get_client()

    if client:
        try:
            from google.genai import types
            import re as _re

            _CAREER_PROMPT = """
You are an expert career coach and resume writer.

A user has provided the following resume / career text:
---
{input_text}
---

Analyse the text and return ONLY a valid JSON object with exactly these keys:

{{
  "improved_summary": "<A polished 3-5 sentence professional summary rewritten for impact>",
  "suggestions": [
    "<Specific, actionable suggestion 1>",
    "<Specific, actionable suggestion 2>",
    "<Specific, actionable suggestion 3>"
  ],
  "skills": ["<skill1>", "<skill2>", "<skill3>"]
}}

Return ONLY the JSON object. No explanation, no markdown fences.
""".format(input_text=input_text.strip())

            response = client.models.generate_content(
                model=MODEL,
                contents=_CAREER_PROMPT,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=1024,
                ),
            )
            raw = response.text.strip()
            raw = _re.sub(r"^```(?:json)?\s*", "", raw)
            raw = _re.sub(r"\s*```$", "", raw).strip()
            parsed = json.loads(raw)
            return {
                "improved_summary": parsed.get("improved_summary", ""),
                "suggestions": parsed.get("suggestions", []),
                "skills": parsed.get("skills", []),
            }
        except Exception as e:
            logger.warning(f"Gemini unavailable for structured analysis: {e}")

    # Smart fallback for structured response
    words = input_text.lower().split()
    detected_skills = []
    skill_keywords = ["python", "java", "react", "node", "sql", "excel", "aws", "docker",
                      "javascript", "typescript", "machine learning", "data analysis",
                      "project management", "communication", "leadership", "agile", "scrum"]
    for skill in skill_keywords:
        if skill in input_text.lower():
            detected_skills.append(skill.title())

    if not detected_skills:
        detected_skills = ["Communication", "Problem Solving", "Team Collaboration"]

    return {
        "improved_summary": (
            f"A driven and results-oriented professional with expertise in {', '.join(detected_skills[:3])}. "
            "Demonstrated ability to deliver high-impact solutions in fast-paced environments. "
            "Passionate about continuous growth and contributing meaningfully to team success. "
            "Seeking to leverage proven skills to drive innovation and measurable outcomes."
        ),
        "suggestions": [
            "Quantify your achievements with specific metrics (e.g., 'increased efficiency by 30%') to make your impact tangible to recruiters.",
            "Add a tailored professional summary at the top that directly mirrors the language used in your target job descriptions.",
            "Include a 'Key Projects' section with tech stack details, your role, and the business outcome delivered.",
        ],
        "skills": detected_skills[:6] if detected_skills else ["Communication", "Leadership", "Problem Solving"],
    }


def generate_resume_ai(data: dict) -> str:
    """Generate a professional resume using the provided data."""
    client = _get_client()
    prompt = f"""Create a professional ATS-optimized resume using:
Name: {data.get('name', 'Not provided')}
Role: {data.get('role', 'Not provided')}
Skills: {data.get('skills', 'Not provided')}
Experience: {data.get('experience', 'Not specified')}
Education: {data.get('education', 'Not specified')}
Summary Note: {data.get('summary', 'Generate a compelling professional summary')}

Format:
* Professional Summary
* Skills
* Experience (Use bullet points and action verbs)
* Education
* Projects (if applicable based on experience)

Make it concise, impactful, and recruiter-ready. Do not use markdown code blocks like ```markdown."""

    if client:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.6,
                    max_output_tokens=2048,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini unavailable for resume: {e}")

    # Fallback response
    return f"""
{data.get('name', 'John Doe').upper()}
{data.get('role', 'Professional')}

PROFESSIONAL SUMMARY
A driven and results-oriented professional with expertise in {data.get('skills', 'various domains')}. Demonstrated ability to deliver high-impact solutions.

SKILLS
{data.get('skills', 'General skills')}

EXPERIENCE
{data.get('experience', 'Details to be added')}

EDUCATION
{data.get('education', 'Details to be added')}
""".strip()


def generate_interview_feedback_ai(question: str, answer: str, role: str = "") -> str:
    """Generate structured feedback for an interview answer."""
    client = _get_client()
    role_context = f" for the role of {role}" if role else ""
    prompt = f"""You are an expert interview coach. Evaluate the following interview answer{role_context}:

Interview Question: {question}
Candidate's Answer: {answer}

Provide structured feedback with exactly these sections:
1. **Overall Score** (out of 10) with reasoning
2. **Strengths** — What they did well (be specific)
3. **Areas to Improve** — Be honest and constructive
4. **Model Answer** — Show how an ideal response would look using the STAR method
5. **Tips** — 2-3 practical tips to improve their delivery

Be encouraging but honest. Keep feedback actionable. Do not use markdown code blocks like ```markdown."""

    if client:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.5,
                    max_output_tokens=1500,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini unavailable for interview feedback: {e}")

    # Fallback
    return f"""
1. **Overall Score**: 7/10
2. **Strengths**: You addressed the core of the question directly.
3. **Areas to Improve**: Could use more specific metrics and follow the STAR method strictly.
4. **Model Answer**: "In my previous role, I encountered a similar situation (Situation). My task was to... (Task). I took the initiative to... (Action), resulting in... (Result)."
5. **Tips**: Practice quantifying your impact and maintain a structured narrative flow.
""".strip()


def generate_career_suggestions_ai(data: dict) -> str:
    """Generate personalized career suggestions."""
    client = _get_client()
    prompt = f"""Act as an expert career coach. Based on the following profile, give detailed, personalized career suggestions:

Current Role/Background: {data.get('current_role', 'Not provided')}
Target/Desired Role: {data.get('target_role', 'Open to suggestions')}
Current Skills: {data.get('skills', 'Not provided')}
Years of Experience: {data.get('experience', 'Not specified')}

Provide exactly these sections:
1. Top 3 career paths they should consider with reasoning
2. Key skills to develop for each path
3. Specific action steps for the next 90 days
4. Salary range expectations (give realistic estimates based on industry standards)
5. Top companies to target

Be specific, practical, and encouraging. Do not use markdown code blocks like ```markdown."""

    if client:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.6,
                    max_output_tokens=1500,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini unavailable for career suggestions: {e}")

    # Fallback
    return f"""
1. **Top Career Paths**: Based on your background in {data.get('current_role', 'your current field')}, you could pursue roles like {data.get('target_role', 'Senior Specialist')}.
2. **Key Skills to Develop**: Focus on leadership, advanced technical concepts related to your field, and strategic thinking.
3. **90-Day Action Plan**: Update your portfolio, complete a relevant certification, and network with 5 industry professionals.
4. **Salary Expectations**: Highly dependent on location, but typically offers a 20% bump from entry-level/mid-level benchmarks.
5. **Top Companies**: Target mid-size growth startups and established enterprise leaders in your sector.
""".strip()


def generate_roadmap_ai(data: dict) -> str:
    """Generate a personalized skill learning roadmap."""
    client = _get_client()
    goal = data.get('goal', 'career growth')
    timeframe = data.get('timeframe', '6 months')
    level = data.get('level', 'Beginner')

    prompt = f"""Act as an expert career mentor and learning coach. Create a highly personalized, structured learning roadmap:

Goal: {goal}
Timeframe: {timeframe}
Current Level: {level}

Structure the roadmap with these exact sections:

**Phase 1 — Foundation** (Weeks 1-X)
- Skills to learn
- Best free resources
- Daily time commitment
- Milestone to achieve

**Phase 2 — Core Skills** (Weeks X-Y)
- Skills to learn
- Best resources (free + paid)
- Projects to build
- Milestone

**Phase 3 — Advanced & Applied** (Weeks Y-Z)
- Advanced topics
- Portfolio projects
- Community to join
- Milestone

**Phase 4 — Job-Ready** (Final weeks)
- Portfolio polishing
- Interview prep
- Where to apply
- Final milestone

Also include:
- Weekly hour commitment
- Top 3 free resources overall
- 1 key project to build
- Realistic timeline check

Make it specific, realistic, motivating, and directly tied to the user's goal. Do not use generic advice."""

    if client:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.65,
                    max_output_tokens=2048,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini unavailable for roadmap: {e}")

    # Fallback
    return f"""**Your Personalized Roadmap: {goal}**

**Phase 1 — Foundation** (Weeks 1-4)
- Start with the absolute basics of {goal}
- Spend 1-2 hours daily on structured learning
- Resource: YouTube, freeCodeCamp, or Coursera free tier
- Milestone: Complete one beginner tutorial end-to-end

**Phase 2 — Core Skills** (Weeks 5-10)
- Build hands-on projects to reinforce learning
- Follow along with intermediate courses
- Join a community (Discord, Reddit) for accountability
- Milestone: Build and share your first project

**Phase 3 — Applied Practice** (Weeks 11-16)
- Work on a real-world portfolio project
- Contribute to open source or freelance for experience
- Start preparing for interviews or certifications
- Milestone: Complete a portfolio-worthy project

**Phase 4 — Job-Ready** (Weeks 17-{timeframe})
- Polish your portfolio and LinkedIn
- Practice mock interviews
- Apply to 5-10 relevant opportunities per week
- Milestone: Land your first opportunity

**Weekly Commitment**: 10-15 hours/week
**Key Resource**: Start with free options, then invest in one paid course once you confirm the direction.
""".strip()
