# Requirements: Wellbeing Companion (server-backed version)

## Introduction

Wellbeing Companion is a single-user web app that runs on the user's own computer. It helps the user
notice patterns in how they feel through daily mood check-ins, journaling, a rule-based burnout and
stress indicator, personalized suggestions, and trends.

This version uses a React frontend and a local Node/Express API that stores data in a JSON file
(`server/data/db.json`). There is no login. The app is not medical advice.

## Glossary

- **Check-in**: one mood rating (1–5) for a calendar day, with an optional note.
- **Mood band**: low (mood 1–2), mid (3), or high (4–5).
- **Signal**: one rule that fired in the burnout and stress indicator.
- **Indicator level**: Low (0 signals), Moderate (1), or High (2 or more).
- **Catalog**: the static list of suggestions in `server/src/data/catalog.json`.
- **Today**: the user's local calendar date, sent by the browser.

## Requirements

### Requirement 1: Daily mood check-in

**User story:** As a user, I want to record how I feel each day, so that I can track my mood over time.

#### Acceptance criteria
1. WHEN the user opens the Today page THEN the system SHALL show five mood options (1 Very low to 5 Great) and an optional note field.
2. WHEN the user saves a check-in with a mood THEN the system SHALL store it for today's date and confirm it was saved.
3. IF a check-in already exists for today THEN the system SHALL pre-fill the form, say the user already checked in, and replace the existing check-in when saved again.
4. IF the mood is not a whole number from 1 to 5 THEN the system SHALL reject the request with a 400 error and a clear message.
5. IF the note is longer than 500 characters THEN the system SHALL reject it with a 400 error.
6. IF the date is invalid or more than one day in the future THEN the system SHALL reject it with a 400 error.
7. WHEN the page is reloaded or the server restarts THEN the system SHALL still show the saved check-in.

### Requirement 2: Journal

**User story:** As a user, I want to write private reflections, so that I can understand myself better.

#### Acceptance criteria
1. WHEN the user saves a new entry THEN the system SHALL store it with a creation time and show it at the top of the list.
2. WHEN the Journal page loads THEN the system SHALL list all entries, newest first, with their date and time.
3. WHEN the user edits an entry and saves THEN the system SHALL update the text, record an update time, and mark the entry as edited.
4. WHEN the user deletes an entry THEN the system SHALL ask for confirmation before removing it.
5. IF the entry text is empty after trimming, or longer than 5000 characters, THEN the system SHALL reject it with a 400 error.
6. IF the user edits or deletes an entry that does not exist THEN the system SHALL return a 404 error.

### Requirement 3: Burnout and stress indicator

**User story:** As a user, I want an early warning when my mood pattern suggests stress, so that I can take care of myself sooner.

#### Acceptance criteria
1. The system SHALL compute the indicator from mood check-ins only.
2. WHEN mood has been 2 or below on 3 or more consecutive days (ending today, or yesterday if today has no check-in) THEN the system SHALL add a "low streak" signal.
3. WHEN the average mood of the last 7 days is at least 0.5 lower than the 7 days before, and each period has at least 3 check-ins, THEN the system SHALL add a "declining trend" signal.
4. WHEN there is no check-in on 3 or more of the previous 7 days (not counting today, or days before the first check-in) THEN the system SHALL add a "missed check-ins" signal.
5. The system SHALL set the level to Low for 0 signals, Moderate for 1, and High for 2 or more.
6. WHEN the indicator is shown THEN the system SHALL display the level, a plain-language reason for each signal, and an explanation of how the indicator is calculated.
7. IF there are no check-ins yet THEN the system SHALL say so instead of showing a level.
8. WHEN the user saves a check-in THEN the system SHALL refresh the indicator without a page reload.

### Requirement 4: Personalized recommendations

**User story:** As a user, I want a few relevant self-care ideas each day, so that I have something practical to try.

#### Acceptance criteria
1. The system SHALL provide a catalog of at least 15 suggestions across mindfulness, exercise, and self-care. Each suggestion lists the mood bands and indicator levels it suits.
2. WHEN the Today page loads THEN the system SHALL show 3 suggestions, each with its category, duration, description, and the reason it was picked.
3. The system SHALL score each suggestion +2 if it matches today's mood band, +2 if it matches the indicator level, and +3 if the user marked it Helpful.
4. IF the user has not checked in today THEN the system SHALL treat every mood band as a match and invite the user to check in.
5. The system SHALL show at most 2 suggestions from the same category, unless fewer than 3 would otherwise be shown.
6. The system SHALL keep the same suggestions throughout a day when the inputs do not change, and vary them across days.
7. WHEN the user marks a suggestion Helpful THEN the system SHALL rank it higher in future picks. WHEN the user clicks Helpful again THEN the system SHALL remove the mark.
8. WHEN the user marks a suggestion "Not for me" THEN the system SHALL stop showing it and offer an Undo.
9. IF feedback refers to an unknown suggestion THEN the system SHALL return a 404 error. IF the verdict is not "helpful" or "not_for_me" THEN the system SHALL return a 400 error.

### Requirement 5: Trends and insights

**User story:** As a user, I want to see my mood over time, so that I can spot patterns.

#### Acceptance criteria
1. WHEN the user opens the Trends page THEN the system SHALL show a mood line chart for the last 7 days, with a toggle for 30 days.
2. The system SHALL show the average mood, check-in count, current streak, and longest streak for the selected range.
3. The system SHALL generate plain-language insights: average mood, change from the previous period, number of low days, best and worst weekday (with at least 7 check-ins in 30 days and a gap of at least 0.5), and streaks.
4. IF the selected range has no check-ins THEN the system SHALL show an empty state instead of a chart.
5. WHEN some days in the range have no check-in THEN the chart SHALL skip them and say so.
6. IF the range is not 7 or 30 THEN the API SHALL return a 400 error.

### Requirement 6: Local data storage

**User story:** As a user, I want my data kept on my own computer, so that it stays private.

#### Acceptance criteria
1. The system SHALL store all data in one JSON file, `server/data/db.json` by default, configurable with `WELLBEING_DATA_FILE`.
2. WHEN the data file does not exist THEN the system SHALL create it with an empty structure.
3. The system SHALL write by saving to a temporary file and renaming it, so a crash cannot leave a partly written file.
4. The system SHALL apply updates one at a time, so concurrent requests do not lose data.
5. IF the data file is not valid JSON THEN the system SHALL refuse to start and explain how to recover.
6. The API SHALL listen on 127.0.0.1 only.
7. The data file SHALL be excluded from git.

### Requirement 7: Sample data

**User story:** As a presenter, I want realistic sample data, so that I can demo every feature quickly.

#### Acceptance criteria
1. WHEN `npm run seed` runs and no data exists THEN the system SHALL create about 30 days of check-ins ending yesterday, plus sample journal entries.
2. The sample data SHALL produce a High indicator level, and leave today empty so the presenter can check in live.
3. IF data already exists THEN the seed script SHALL do nothing unless run with `--force`.

### Requirement 8: Safety, accessibility, and usability

**User story:** As a user, I want an app that is clear, accessible, and honest about its limits.

#### Acceptance criteria
1. The system SHALL show a "not medical advice" disclaimer on every page.
2. The system SHALL NOT diagnose, detect crises, or send any data to third parties.
3. Every form input SHALL have a label, and every control SHALL work with a keyboard and show a visible focus state.
4. Every data view SHALL show loading, error (with retry), and empty states.
5. The layout SHALL work on mobile and desktop screen widths.
6. The header SHALL show whether the local API is reachable.
