# FEATURE MAPPING SPECIFICATION
## Modern Festival Result Management System

### 1. Functional Module Matrix

| Requirement | Module | UI Route / Component | API Endpoint / Server Action | Access Control |
|---|---|---|---|---|
| Multi-Festival Management | Admin / Festival | `/admin/festivals`, `/admin/festivals/new` | `GET/POST /api/festivals`, `PUT/DELETE /api/festivals/[id]` | Super Admin |
| Main Analytics Dashboard | Admin / Dashboard | `/admin/dashboard` | `GET /api/dashboard/stats`, `GET /api/dashboard/leaderboard` | All Admin Roles |
| Institution Management | Admin / Institutions | `/admin/institutions`, `.../import` | `GET/POST /api/institutions`, `POST /api/institutions/import` | Super Admin |
| Participant Management | Admin / Participants | `/admin/participants`, `.../import` | `GET/POST /api/participants`, `POST /api/participants/import` | Super Admin, Program Admin |
| Program Management | Admin / Programs | `/admin/programs`, `.../new` | `GET/POST /api/programs`, `PUT/DELETE /api/programs/[id]` | Super Admin, Program Admin |
| Keyboard Mark Entry Grid | Admin / Mark Entry | `/admin/mark-entry/[programId]` | `GET /api/mark-entry/[programId]`, `POST /api/mark-entry/save` | Judge, Operator, Super Admin |
| Result Verification Flow | Admin / Verification | `/admin/verification`, `.../[programId]` | `GET /api/verification/list`, `POST /api/verification/action` | Verifier, Super Admin |
| Public Portal & Search | Public / Portal | `/`, `/search`, `/programs/[id]` | `GET /api/public/results`, `GET /api/public/leaderboard` | Public (Unauthenticated) |
| Live Championship Board | Public / Leaderboard | `/leaderboard` | `GET /api/public/leaderboard` | Public (Unauthenticated) |
| Printable PDF & Reports | Reports Engine | `/admin/reports`, `/reports/[type]` | `GET /api/reports/pdf/[id]`, `GET /api/reports/export` | Admin & Public (for published) |

---

### 2. User Roles & Permission Matrix

| Capability | Super Admin | Program Admin | Judge / Operator | Verifier | Public |
|---|:---:|:---:|:---:|:---:|:---:|
| Create/Edit Festivals | :white_check_mark: | :x: | :x: | :x: | :x: |
| Manage User Accounts & Roles | :white_check_mark: | :x: | :x: | :x: | :x: |
| Configure Scoring & Grade Rules | :white_check_mark: | :x: | :x: | :x: | :x: |
| Add / Import Institutions | :white_check_mark: | :x: | :x: | :x: | :x: |
| Register / Import Participants | :white_check_mark: | :white_check_mark: | :x: | :x: | :x: |
| Create / Schedule Programs | :white_check_mark: | :white_check_mark: | :x: | :x: | :x: |
| Enter & Draft Judge Marks | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: | :x: |
| Submit Marks for Verification | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: | :x: |
| Verify & Return Results | :white_check_mark: | :x: | :x: | :white_check_mark: | :x: |
| Approve & Publish Results | :white_check_mark: | :x: | :x: | :x: | :x: |
| View Unverified / Draft Results | :white_check_mark: | Assigned Only | Assigned Only | :white_check_mark: | :x: |
| View Published Results & Ranks | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Download Official PDF Result Sheets | :white_check_mark: | :white_check_mark: | :x: | :white_check_mark: | :white_check_mark: |

---

### 3. Detailed UI Screen Flows

#### A. Rapid Mark Entry Interface (`/admin/mark-entry/[programId]`)
- **Top Information Bar**:
  - Program Code, Program Name, Section/Category, Type (Individual/Group).
  - Maximum Marks per Judge ($M_{max}$), Total Judges Assigned, Status Pill (`DRAFT`, `SUBMITTED`, etc.).
  - Action buttons: `Save Draft (Ctrl+S)`, `Submit for Verification`, `Print Blank Mark Sheet`.
- **Keyboard-Optimized Spreadsheet Grid**:
  - Columns: `Chest No`, `Participant / Troop`, `Institution`, `Judge 1`, `Judge 2`, `Judge 3`, `Total`, `Average`, `Status`, `Remarks`.
  - Full keyboard traversal (`Tab`, `Shift+Tab`, `ArrowUp`, `ArrowDown`, `Enter`).
  - Real-time client-side calculation of row total and average on keystroke with zero lag.
  - Cell validation: Red border and tooltip if value $> M_{max}$ or negative.
  - Quick status dropdown for `Present`, `Absent`, `Disqualified`, `Withheld`.
  - Autosave indicator: "Saved to local cache & synced with server".

#### B. Result Verification Suite (`/admin/verification/[programId]`)
- Side-by-side comparison view:
  - Computed scores, derived positions (1st, 2nd, 3rd) and grades (A, B, C).
  - Flags highlighted for close margins, ties, or unusual score spreads between judges (e.g. Judge 1 gave 95 while Judge 2 gave 40).
  - Action buttons: `Approve Result`, `Reject & Return with Remarks`.

#### C. Public Portal & Live Championship Leaderboard (`/`, `/leaderboard`)
- Minimalist hero with active festival identity, venue, dates, and live ticker.
- Universal search bar: Type any student name, chest number, school name, or program code for immediate filtered results.
- Top 3 institutions highlighted with podium cards (Gold, Silver, Bronze badges) displaying points, 1st, 2nd, 3rd counts.
- Real-time filterable tables by Category (Sub-Junior, Junior, Senior) and Program.

