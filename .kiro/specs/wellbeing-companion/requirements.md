# Requirements: Wellbeing Companion (browser-only version)

## Introduction

Wellbeing Companion is a single-user web app that helps the user notice patterns in how they feel
through daily mood check-ins, journaling, a rule-based burnout and stress indicator, personalized
suggestions, and trends.

This version runs entirely in the browser. All logic runs on the client, and all data is stored in
the browser's `localStorage`. There is no server and no login, so the app can be hosted as a static
site on AWS Amplify Hosting. The app is not medical advice.

This branch (`static-localstorage`) was refactored from the server-backed version on `master`.
Requirements 1–5 keep the same behavior. Requirements 6–9 cover what changed.

## Glossary

- **Check-in**: one mood rating (1–5) for a calendar day, with an optional note.
- **Mood band**: low (mood 1–2), mid (3), or high (4–5).
- **Signal**: one rule that fired in the burnout and stress indicator.
- **Indicator level**: Low (0 signals), Moderate (1), or High (2 or more).
- **Catalog**: the static list of suggestions in `client/src/data/catalog.json`.
- **Today**: the user's local calendar date, taken from the browser.
- **Browser storage**: `localStorage` for the site's origin, under the key `wellbeing-companion:v1`.

## Requirements

### Requirement 1: Daily mood check-in

**User story:** As a user, I want to record how I feel each day, so that I can track my mood over time.

#### Acceptance criteria
1. WHEN the user opens the Today page THEN the system SHALL show five mood options (1 Very low to 5 Great) and an optional note field.
2. WHEN the user saves a check-in with a mood THEN the system SHALL store it for today's date and confirm it was saved.
3. IF a check-in already exists for today THEN the system SHALL pre-fill the form, say the user already checked in, and replace the existing check-in when saved again.
4. IF the mood is not a whole number from 1 to 5 THEN the system SHALL reject it and show a clear message.
5. IF the note is longer than 500 characters THEN the system SHALL reject it and show a clear message.
6. WHEN the page is reloaded or the browser is reopened THEN the system SHALL still show the saved check-in.

### Requirement 2: Journal

**User story:** As a user, I want to write private reflections, so that I can understand myself better.

#### Acceptance criteria
1. WHEN the user saves a new entry THEN the system SHALL store it with a creation time and show it at the top of the list.
2. WHEN the Journal page loads THEN the system SHALL list all entries, newest first, with their date and time.
3. WHEN the user edits an entry and saves THEN the system SHALL update the text, record an update time, and mark the entry as edited.
4. WHEN the user deletes an entry THEN the system SHALL ask for confirmation before removing it.
5. IF the entry text is empty after trimming, or longer than 5000 characters, THEN the system SHALL reject it and show a clear message.
6. IF the user edits or deletes an entry that no longer exists (for example, deleted in another tab) THEN the system SHALL show a clear message.

### Requirement 3: Burnout and stress indicator

**User story:** As a user, I want an early warning when my mood pattern suggests stress, so that I can take care of myself sooner.

#### Acceptance criteria
1. The system SHALL compute the indicator in the browser from mood check-ins only.
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
9. IF the catalog file is malformed (missing or duplicate IDs, unknown category, band, or level) THEN the app SHALL fail at startup with a message naming the bad item.

### Requirement 5: Trends and insights

**User story:** As a user, I want to see my mood over time, so that I can spot patterns.

#### Acceptance criteria
1. WHEN the user opens the Trends page THEN the system SHALL show a mood line chart for the last 7 days, with a toggle for 30 days.
2. The system SHALL show the average mood, check-in count, current streak, and longest streak for the selected range.
3. The system SHALL generate plain-language insights: average mood, change from the previous period, number of low days, best and worst weekday (with at least 7 check-ins in 30 days and a gap of at least 0.5), and streaks.
4. IF the selected range has no check-ins THEN the system SHALL show an empty state instead of a chart.
5. WHEN some days in the range have no check-in THEN the chart SHALL skip them and say so.

### Requirement 6: Browser storage

**User story:** As a user, I want my data kept in my own browser, so that it never leaves my device.

#### Acceptance criteria
1. The system SHALL store all data as one JSON value in browser storage under the key `wellbeing-companion:v1`.
2. The system SHALL NOT send any user data over the network.
3. WHEN no stored data exists THEN the system SHALL start with an empty dataset.
4. IF the stored value cannot be parsed THEN the system SHALL keep the raw value under a backup key (`wellbeing-companion:v1:corrupt-<timestamp>`) and start with an empty dataset, rather than discarding it.
5. IF browser storage is full THEN the system SHALL show a message saying the change could not be saved, and SHALL keep the previous data intact.
6. The footer SHALL tell the user that data is stored only in this browser and is lost if browser data is cleared.
7. All storage access SHALL go through the `Store` interface, so the backend can be replaced later without changing components.

### Requirement 7: Sample data and data controls

**User story:** As a presenter, I want to load realistic sample data from the app, so that I can demo every feature without any command-line tools.

#### Acceptance criteria
1. The footer SHALL show "Load sample data" and "Delete all my data" buttons on every page.
2. WHEN the user chooses "Load sample data" THEN the system SHALL ask for confirmation, warning that it replaces everything stored in this browser.
3. WHEN confirmed THEN the system SHALL store about 30 days of check-ins ending yesterday plus sample journal entries, and reload so every page shows the new data.
4. The sample data SHALL produce a High indicator level, and leave today empty so the presenter can check in live.
5. WHEN the user chooses "Delete all my data" and confirms THEN the system SHALL remove all check-ins, journal entries, and feedback.

### Requirement 8: Static hosting on AWS Amplify

**User story:** As the owner, I want to host the app without running a server, so that it is cheap and simple to operate.

#### Acceptance criteria
1. `npm run build` SHALL produce a fully static site in `client/dist` with no server-side code.
2. The repository SHALL include an `amplify.yml` that installs dependencies, runs the build, and publishes `client/dist`.
3. The app SHALL use hash-based routes (`#/today`, `#/journal`, `#/trends`), so it works without server rewrite rules.
4. ID generation SHALL work in both secure (HTTPS, localhost) and non-secure contexts.

### Requirement 9: Safety, accessibility, and usability

**User story:** As a user, I want an app that is clear, accessible, and honest about its limits.

#### Acceptance criteria
1. The system SHALL show a "not medical advice" disclaimer on every page.
2. The system SHALL NOT diagnose, detect crises, or load third-party scripts (analytics, ads, or trackers), because any script on the page could read browser storage.
3. Every form input SHALL have a label, and every control SHALL work with a keyboard and show a visible focus state.
4. Every data view SHALL show loading, error (with retry), and empty states.
5. Destructive actions (deleting an entry, loading sample data, deleting all data) SHALL ask for confirmation.
6. The layout SHALL work on mobile and desktop screen widths.
