# Product: Wellbeing Companion (browser-only version)

A simple, single-user web app that helps people notice and look after their wellbeing. This version
runs entirely in the browser and stores data in `localStorage`, so it can be hosted as a static site
on AWS Amplify Hosting.

## Features
- Daily mood check-in: mood 1–5 plus an optional note. One check-in per day; saving again updates it.
- Journal: free-text reflections with create, list (newest first), edit, and delete.
- Burnout and stress indicator: rule-based, using mood check-ins only. Shows a level (Low, Moderate, High) and the reasons.
- Recommendations: 3 daily suggestions (mindfulness, exercise, self-care) from a static catalog, adjusted by mood, indicator level, and "Helpful" / "Not for me" feedback.
- Trends: 7 and 30-day mood chart, check-in streaks, and plain-language insights.
- Data controls: "Load sample data" and "Delete all my data" in the footer.

## Principles
- Not medical advice. The footer disclaimer must stay visible on every page. Do not add diagnosis, crisis detection, or clinical language.
- Explainable. Every indicator level and recommendation shows why it was given. No opaque scoring and no AI or LLM calls.
- Private by default. Data never leaves the user's browser. No analytics, tracking, or third-party scripts, because any script on the page can read `localStorage`.
- Honest about storage. The UI tells users that data lives only in this browser and is lost if browser data is cleared.
- Gentle tone. UI copy is supportive and plain. Avoid alarming or judgmental wording.

## Out of scope (for now)
- Any backend, accounts, login, or multiple users
- Sync between devices or browsers
- Export and import (a likely next feature)
- Journal text analysis
- Automated tests (planned later, see tech.md)
