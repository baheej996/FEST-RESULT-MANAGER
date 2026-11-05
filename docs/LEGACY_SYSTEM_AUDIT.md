# LEGACY SYSTEM AUDIT & ARCHITECTURAL TRANSITION
## Festival Result Management System

### 1. Executive Summary & Audit Context

The original workflow operated on a distributed Google Sheets and Google Apps Script architecture:
- **Spreadsheet ID**: `17lT_iB49_q-Y8B1eQ6uUuABILf1_fNuHDiPxic3Pc5o`
- **Apps Script Project ID**: `1Cq2aRb28-4sFMttGotzKRDwNeCcayaq6VOcK5C4sf18jjMffbAAac8lP`

Under high-volume festival conditions (hundreds of participants across tens of stages with parallel judges entering scores simultaneously), Google Sheets exhibits severe technical bottlenecks:
1. **Google Apps Script Execution Quotas**: Hard 6-minute execution limits and strict 30-100 API calls/minute quotas cause catastrophic timeouts during live mark entry.
2. **Concurrency & Race Conditions**: Google Sheets cell writes from concurrent browser sessions frequently collide, overwrite data, or trigger recalculation delays.
3. **Fragility of Spreadsheet Formulas**: VLOOKUP / QUERY formulas break when rows or column headers are shifted or modified by operators.
4. **Access Control Leakage**: Sharing spreadsheets with judges and operators exposes raw formulas, unpublished scores, and student records.

The system is now completely transitioning to an autonomous, high-performance, database-backed web application.

---

### 2. Conceptual Mapping: Google Sheets to Relational Database

| Legacy Google Sheets Entity | Modern Relational Entity | Data Structure & Enhancements |
|---|---|---|
| Master Festival Sheet / Tab | `festivals` table | Full multi-festival tenant isolation, unique code, dates, status, logo. |
| Schools / Institutions Tab | `institutions` table | Unique school code, district, contact, foreign key association. |
| Participants Master Tab | `participants` table | Unique registration number, category, class, foreign key to institution. |
| Program List / Item Master | `programs` & `program_categories` | Category taxonomy, individual/group flag, max marks, judge count, configurable rules. |
| Mark Entry Sheet per Event | `marks` & `competition_entries` | Normalized per-entry per-judge score records, preventing cell collision. |
| Formula Columns (Total, Avg) | Server Calculation Engine | Pure, deterministic mathematical evaluation in TypeScript runtime. |
| Result Sheet / Rank Columns | `results` & `result_positions` | ACID-compliant position and grade allocation with tie handling. |
| Overall Points / Tally Sheet | `institution_points` table | Materialized aggregation updated atomically on publication. |
| Google Forms / Apps Script Dialogs | Next.js Responsive UI | Type-safe React forms, keyboard spreadsheet grid with client-side zero-latency calculations. |

---

### 3. Transition Strategy & Safety Guarantees

1. **Zero External Google Dependency**:
   - No Google API keys, Google Service Accounts, or Google Sheets quotas required.
   - Self-contained database and runtime running locally or on any server.
2. **Business Rule Preservation**:
   - Standard festival scoring methodology (1st = 5/10 pts, 2nd = 3/6 pts, 3rd = 1/2 pts; Grade A $\ge 70\%$, Grade B $\ge 60\%$, Grade C $\ge 50\%$) is built directly into the calculation engine with configurable overrides.
3. **Data Portability**:
   - Full CSV / Excel import and export capabilities for institutions, participants, programs, and results, allowing easy interoperability with spreadsheet files.

