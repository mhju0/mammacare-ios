---
name: manual-sql
description: Schema-change procedure for MammaCare (Alembic is forbidden). Use whenever a task requires ANY database structure change — new/dropped columns, constraints, indexes, enums, or one-off data fixes — because create_all() will not alter existing tables. Always ends in NEEDS SENIOR REVIEW.
---

# manual-sql — hand-managed schema changes

Policy: **No Alembic.** All DDL beyond first-time `create_all()` table creation
goes through `backend/manual_sql/`. `backend/manual_sql/README.md` is the
authoritative procedure — this skill operationalizes it.

## Why this exists
`create_all()` only creates missing tables. It will NOT alter existing columns,
types, FKs, enums, or constraints. Any such change silently diverges code from
DB unless applied here by hand.

## Procedure
1. **New file**: `backend/manual_sql/NNN_short_description.sql` — NNN is the next
   3-digit zero-padded number (check `ls backend/manual_sql/`), then an English
   kebab-case description. One file = one change.
2. **File contents (all required)**:
   - Header comment: purpose + **rollback SQL** to undo the change.
   - Wrapped in `BEGIN;` … `COMMIT;`.
   - **Idempotent**: `IF EXISTS` / `IF NOT EXISTS` everywhere — safe to re-run,
     and safe on a fresh DB where the change is already absent/present.
   - **Pre-SELECT** showing state before the change and **post-SELECT** showing
     state after, inside the file, labeled `[pre]` / `[post]`.
   - Never mention constraints/indexes that must be preserved (e.g.
     `ex_ingredient_testing_no_overlap`) in a file that drops something else.
3. **If destructive** (DROP column/table, data delete/update): take a local
   `pg_dump` backup FIRST. `*.dump` is PII → gitignored, local/external disk only,
   never committed, never printed.
4. **Apply** via psql:
   ```bash
   psql "$DATABASE_URL" -f backend/manual_sql/NNN_short_description.sql
   ```
5. **Verify**: compare `[pre]`/`[post]` outputs to expectations by eye. If wrong,
   `ROLLBACK;` (do not COMMIT).

## Done criteria
- SQL file exists with rollback comment + pre/post SELECTs
- Applied via psql, pre/post outputs pasted into the report
- Rollback path documented

## Hard limits
- Schema changes are on the mandatory escalation list: the final report is always
  `NEEDS SENIOR REVIEW`, never `SAFE TO COMMIT`.
- Never run the DDL through SQLAlchemy/create_all as a shortcut.
