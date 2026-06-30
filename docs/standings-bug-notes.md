# Client Standings Auto-Update Bug Analysis & Fix Notes

## 1. Issue Description
The client reported that when they recorded match results, the standings tables (played matches, goals, points) did not automatically update.

## 2. Root Cause
* **Group Draw & Schedule Desync:** When the client/admin performed a **Group Draw**, teams were shuffled and assigned to new groups (e.g., *Al Damac* in Group A, *Al Hilal* in Group C). However, the existing matches in the database still contained the old pairings and old groups (e.g., a match between *Al Damac* and *Al Hilal* tagged with `group: 'C'`).
* **Strict Match-Group Filtering:** The `calculateStandings(teams, matches, group)` engine in `src/utils/standings.js` filtered matches with `m.group === group`.
* When rendering Group A standings, the engine filtered matches with `group: 'A'`. Since the match between *Al Damac* and *Al Hilal* was tagged with Group C, it was excluded from Group A.
* When rendering Group C standings, the engine included the match. However, during statistics aggregation, the engine did:
  ```javascript
  const teamA = table[match.teamA]; // Al Damac (Group A)
  const teamB = table[match.teamB]; // Al Hilal (Group C)
  if (!teamA || !teamB) return; // table only had Group C teams, so teamA was undefined
  ```
  This caused the match to be silently skipped entirely. As a result, matches were never updated in any standings table.

## 3. Resolution
The standings calculation was refactored in `src/utils/standings.js` to dynamically evaluate group matches based on the **current group assignments of the participating teams**, rather than strictly relying on the match's outdated `group` tag.

```javascript
export function calculateStandings(teams, matches, group) {
  const groupTeams = teams.filter((t) => t.group === group)

  const table = {}
  groupTeams.forEach((team) => {
    table[team.id] = { ... }
  })

  // Filter completed matches where BOTH teams are currently assigned to this group
  const groupMatches = matches.filter(
    (m) => m.status === 'completed' && m.result && table[m.teamA] && table[m.teamB]
  )
```

## 4. Local Environment Improvements
We created a separate development script for local development against emulators:
* **Default Environment (`npm run dev`):** Runs with `VITE_USE_EMULATORS=false`, connecting safely by default to the Live Cloud Firestore.
* **Emulator Environment (`npm run dev:local`):** Runs with `vite --mode emulator` which loads `.env.emulator` (overriding `VITE_USE_EMULATORS=true`), connecting the app to local emulators.
* **Playwright Isolation (`playwright.config.js`):** Updated `webServer` command to use `npm run dev:local` to ensure all end-to-end tests run under safe local isolation against emulators rather than hitting production.

## 5. Verification Commands
* Run Unit Tests: `npx vitest run tests/utils/standings.test.js`
* Run Playwright reproduction/integration test: `npx playwright test tests/e2e/standings-update.spec.js`
