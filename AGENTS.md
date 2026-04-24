<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Sunlife Project Memory

## 1. Project Overview

- Sunlife is a separate educational / school platform copy derived from the original Úlgi project.
- The original site must remain separate and must not be overwritten or coupled to the Sunlife copy.
- The project already works locally.
- Sunlife is being evolved carefully without breaking the existing application structure or product logic.

## 2. Tech Stack

- Framework: Next.js 16, App Router, Turbopack
- Language: TypeScript strict
- Database: Supabase Postgres
- Auth: Supabase Auth
- Realtime: Supabase Realtime
- Media: Cloudinary
- AI: OpenAI API
- UI: Tailwind CSS 4, shadcn/ui, lucide-react
- Locale: Kazakh, `lib/locale/kk.ts`
- Hosting target: Netlify Free, not Vercel

## 3. Current Product Direction

- Sunlife is the active brand replacing visible Úlgi branding in the project copy.
- The platform remains an educational / school-focused social product.
- The next major functional direction is a new assignments / tests module named `Тапсырмалар`.

## 4. Already Decided

1. The project is being renamed from Úlgi to Sunlife.
2. Only the visible brand and color scheme should change for the branding task.
3. Architecture, database, Supabase, Cloudinary, OpenAI, API routes, and auth flow must not be broken.
4. Sunlife visual palette:
   - Primary / brand color: `#F59E0B`
   - Warm background / surface: `#FFF7ED`
5. Mathematical visual elements must not be added.
6. A full redesign is not being done.
7. The original site remains separate.
8. The Sunlife copy must not be deployed to Vercel.
9. Netlify is the primary free non-Vercel hosting target for Sunlife.
10. The next major feature is the assignments / tests module `Тапсырмалар`.

## 5. Deployment Rules

- Do not use Vercel for the Sunlife copy.
- Keep the original site separate from the Sunlife deployment flow.
- Prefer Netlify as the primary free non-Vercel hosting target unless the user explicitly changes that decision.
- Do not rename environment variables unless it is clearly safe.
- Do not expose secrets in logs, docs, commits, or memory files.

## 6. Current Major Feature: Тапсырмалар

- `Тапсырмалар` is a new assignments / tests module for math preparation.
- Assignments are created only by administrators.
- The assignment format is test-only.
- No files, photos, or attachments are part of this module.
- All roles can see assignments.
- Students can take tests and submit answers.
- The system automatically checks tests against correct options.
- Admins can review student submissions.
- Admins can confirm or adjust results.
- Admins can leave short feedback in Kazakh.
- There are no deadlines.
- The interface for this module must be in Kazakh.

Categories:

- `Тестілеу`
- `ҰБТ-ға дайындық`
- `Үй тапсырмасы`
- `Олимпиада`
- `Бақылау жұмысы`
- `Тоқсандық тапсырмалар`

## 7. Planned Implementation Stages

### Prompt 1/4 — Audit & Technical Plan

- Study the project.
- Check roles.
- Check Supabase schema.
- Check whether classes already exist.
- Check the admin panel.
- Check the main navigation.
- Check locale structure.
- Do not change code.
- Prepare a technical plan.

### Prompt 2/4 — Database, RLS, Backend Queries

- Create Supabase migrations.
- Add tables if needed.
- Add RLS policies.
- Add backend / query layer.
- Implement safe auto-check logic.

### Prompt 3/4 — Admin Interface

- Add an admin page for assignments.
- Create the test creation form.
- Add questions and answer options.
- Select class and category.
- View submissions.
- Review / confirm answers.
- Add feedback.

### Prompt 4/4 — Student Interface & Final QA

- Add the `Тапсырмалар` page for students.
- Show the assignments list.
- Add test-taking flow.
- Add answer submission.
- Add result view.
- Perform final project QA.

## 8. Engineering Rules

- Do not rewrite the project from scratch.
- Do not change the stack unless explicitly requested.
- Do not break existing architecture.
- Prefer minimal, safe, production-quality changes.
- Use existing project patterns before inventing new ones.
- Use TypeScript strict.
- Do not add dependencies unless clearly necessary.
- If something is risky, explain it before changing it.
- Before implementation, audit the existing project first.

## 9. Database & Security Rules

- Do not break Supabase Auth.
- Do not break RLS policies.
- Do not break API routes.
- Do not break Cloudinary upload / delete logic.
- Do not break OpenAI logic.
- Do not break Supabase Realtime.
- Do not commit `.env.local`.
- Do not expose secret keys.
- Never store secret keys, tokens, passwords, service role values, API keys, or `.env.local` contents in `AGENTS.md`.

## 10. UI & Localization Rules

- UI text must be in Kazakh unless an existing project pattern clearly requires otherwise.
- Do not add mathematical visual elements.
- Do not do a full redesign when only minimal visual changes are requested.
- Preserve the existing layout and navigation patterns unless the task explicitly requires otherwise.
- Keep the Sunlife palette direction consistent:
  - Primary / brand color: `#F59E0B`
  - Warm background / surface: `#FFF7ED`

## 11. Memory Update Rule

After every 5 major user prompts or after every 5 substantial development tasks, update `AGENTS.md`.

The update must include:

- what was implemented;
- what files were changed;
- what database migrations were added;
- what commands were run;
- what errors were found;
- what decisions were made;
- what remains unfinished;
- what the next recommended step is.

If the user explicitly says `обнови память`, `update memory`, `зафиксируй в памяти`, or similar, update `AGENTS.md` immediately, even if fewer than 5 prompts passed.

Never store secret keys, tokens, passwords, service role values, API keys, or `.env.local` contents in `AGENTS.md`.

## 12. Work Log

Initial memory created.

Known context:

- Project was copied from the original Úlgi project.
- New copy is called Sunlife.
- Brand / color redesign was requested.
- Sunlife palette: `#F59E0B` and `#FFF7ED`.
- Deployment should be on Netlify, not Vercel.
- New planned feature is the assignments / test module named `Тапсырмалар`.
- Implementation will be split into 4 prompts.

2026-04-24 — Prompt 1/4 audit completed.

- Confirmed existing roles: `student`, `teacher`, `admin`.
- Confirmed there are no `classes` / `class_members` tables yet.
- Decided to use `profiles.class_name` for MVP targeting instead of adding class normalization now.
- Decided to store correct answers separately in `assignment_answer_keys`.
- Decided to calculate test score server-side in a secure API route, not on the client.

2026-04-24 — Prompt 2/4 backend foundation completed.

- Implemented new assignment schema and RLS migrations:
  - `supabase/migrations/0005_assignments_schema.sql`
  - `supabase/migrations/0006_assignments_rls.sql`
- Added assignment constants, database types, query layer, and secure API routes:
  - `lib/constants.ts`
  - `types/supabase.ts`
  - `types/db.ts`
  - `lib/supabase/verify-request.ts`
  - `lib/supabase/queries/assignments.ts`
  - `lib/supabase/queries/assignment-submissions.ts`
  - `app/api/assignments/submit/route.ts`
  - `app/api/assignments/review/route.ts`
- Commands run:
  - `npm run lint -- .` (failed because generated `.netlify/` output is included by ESLint)
  - `npm run lint -- --ignore-pattern '.netlify' app/api/assignments lib/supabase/queries lib/supabase/verify-request.ts lib/constants.ts types/supabase.ts types/db.ts`
  - `npm run build`
- Errors found:
  - default ESLint run currently scans generated `.netlify/` files and produces unrelated lint noise
- Decisions made:
  - one submission per student per assignment for MVP
  - `assignment_answer_keys` stays admin/server-only
  - submission and admin review writes go through secure API routes
  - no `classes` / `class_members` tables in Prompt 2
- Remains unfinished:
  - admin UI for creating/reviewing assignments
  - student UI for taking tests and viewing results

2026-04-24 — Prompt 3/4 admin interface completed.

- Implemented admin assignments UI:
  - assignments list page
  - new assignment form
  - assignment detail page
  - submissions page
  - review dialog using the secure review API
  - admin sidebar navigation item
- Files changed:
  - `app/(admin)/admin-sidebar.tsx`
  - `app/(admin)/admin/assignments/page.tsx`
  - `app/(admin)/admin/assignments/new/page.tsx`
  - `app/(admin)/admin/assignments/[id]/page.tsx`
  - `app/(admin)/admin/assignments/[id]/submissions/page.tsx`
  - `components/assignments/admin-assignments-table.tsx`
  - `components/assignments/admin-assignment-form.tsx`
  - `components/assignments/admin-assignment-detail.tsx`
  - `components/assignments/admin-submissions-table.tsx`
  - `components/assignments/admin-review-dialog.tsx`
  - `lib/locale/kk.ts`
  - `lib/supabase/queries/assignments.ts`
  - `lib/supabase/queries/assignment-submissions.ts`
- Database migrations added in this step:
  - none
- Commands run:
  - `npm run lint -- --ignore-pattern '.netlify' 'app/(admin)/admin/assignments' components/assignments 'app/(admin)/admin-sidebar.tsx' lib/locale/kk.ts lib/supabase/queries/assignments.ts lib/supabase/queries/assignment-submissions.ts`
  - `npm run build`
- Errors found:
  - no source-code errors after implementation
- Decisions made:
  - admin create flow uses one safe nested helper in query layer
  - admin review uses the secure API route instead of direct client mutation
  - detail/submissions routes stay inside the existing `/admin` structure
- Remains unfinished:
  - student assignments UI and final QA

2026-04-24 — Prompt 4/4 student interface and final QA completed.

- Implemented student assignment flow:
  - `/assignments` list page
  - `/assignments/[id]` player page
  - `/assignments/[id]/result` result page
- Added assignment card, list, and navigation item
- Protected `/assignments` through `proxy.ts`
- Added Kazakh locale strings for student assignment UI
- Commands run:
  - `npm run lint -- --ignore-pattern '.netlify' app components lib types`
  - `npm run build`
- Errors found:
  - no build or lint errors after final fix
- Decisions made:
  - score remains server-side
  - student does not see answer keys
  - one submission per student per assignment
- Remains unfinished:
  - none for Prompt 4B scope

## 13. Open Questions

- How should admin assignment creation UI handle draft validation before publish?
- Should published assignments be visible to all authenticated roles in the list, while submit remains student-only?
- Does Prompt 4 need to lock the test UI after the first submission immediately from query state or after explicit result refresh?
- Should mobile bottom navigation get a direct `Тапсырмалар` item, or should it stay one tap deeper to avoid crowding?

## 14. Next Recommended Step

Next recommended step:
Run Prompt 4/4 — Student Interface & Final QA.
