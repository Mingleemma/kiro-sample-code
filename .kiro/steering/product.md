# Product: Wellbeing Companion

A simple, single-user web app that helps people notice and look after their wellbeing.

## Features
- Daily mood check-in: mood 1–5 plus an optional note. One check-in per day; saving again updates it.
- Journal: free-text reflections with create, list (newest first), edit, and delete.
- Burnout and stress indicator: rule-based, using mood check-ins only. Shows a level (Low, Moderate, High) and the reasons.
- Recommendations: 3 daily suggestions (mindfulness, exercise, self-care) from a static catalog, adjusted by mood, indicator level, and "Helpful" / "Not for me" feedback.
- Trends: 7 and 30-day mood chart, check-in streaks, and plain-language insights.

## Principles
- Not medical advice. The footer disclaimer must stay visible on every page. Do not add diagnosis, crisis detection, or clinical language.
- Explainable. Every indicator level and recommendation shows why it was given. No opaque scoring and no AI or LLM calls.
- Private by default. Data stays on the user's machine. No analytics, tracking, or third-party scripts.
- Gentle tone. UI copy is supportive and plain. Avoid alarming or judgmental wording.

## Out of scope (for now)
- Accounts, login, or multiple users
- Cloud sync or hosting
- Journal text analysis
- Automated tests (planned later, see tech.md)
