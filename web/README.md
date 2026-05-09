# HappyHouse IELTS Platform

A full-stack web platform for HappyHouse English Center. Covers public IELTS placement tests, a school management system (classes, enrolled students, attendance), and a student portal.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (portal) + SHA-256 cookie (admin) |
| Toast | sonner |
| Deployment | Vercel (root dir = `web/`) |

**Font:** Be Vietnam Pro (latin + vietnamese subsets)  
**Brand colours:** Red `#E8303A`, Navy `#1A2744`, Gold `#F5A623`, Background `#F7F6F2`

---

## Repository Layout

```
happyhouse/
├── web/                   ← Next.js app (Vercel root)
│   ├── app/               ← All pages (App Router)
│   ├── components/        ← React components
│   ├── lib/               ← Shared utilities, Supabase clients, context
│   ├── types/             ← TypeScript interfaces
│   ├── public/            ← Static assets
│   └── middleware.ts      ← Route auth (admin + portal)
├── supabase/              ← SQL migrations & schema
└── index.html             ← Legacy static landing (superseded)
```

---

## Environment Variables

Create `web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wvfbmfbfpqkqyeoirvpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # anon/public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # service_role key (server only, never exposed)
ADMIN_PASSWORD=happyhouse2025               # admin panel password
NEXT_PUBLIC_SITE_URL=https://your-domain    # used in sitemap + OG tags
```

---

## Development

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
```

---

## Route Map

### Public routes

| URL | Description |
|---|---|
| `/` | Landing page — hero + student registration + test type selection |
| `/test` | Anonymous test engine (mini/full) — loads questions from DB |
| `/result` | Results after submitting anonymous test |
| `/t/[testId]` | Curated test link — student registers then takes a specific published test |
| `/portal/login` | Student portal login (phone + password) |
| `/portal` | Student dashboard — enrolled classes, assigned tests, results |
| `/portal/test/[testId]` | Take an assigned test from the portal |

### Admin routes (`/admin/*`, password-protected)

| URL | Description |
|---|---|
| `/admin/login` | Admin password login |
| `/admin/dashboard` | Stats: students, sessions, band distribution, recent results |
| `/admin/students` | Ứng viên — people who took the entry test (prospects, not enrolled) |
| `/admin/students/[id]` | Prospect detail + session history |
| `/admin/sessions` | All test submissions with filters |
| `/admin/tests` | Curated test manager |
| `/admin/tests/new` | Create test (name + time + question picker) |
| `/admin/tests/[id]` | Edit test, assign questions, publish/unpublish |
| `/admin/questions` | Question bank with search + section filter |
| `/admin/questions/new` | Create standalone grammar/vocab question |
| `/admin/questions/[id]` | Edit question |
| `/admin/passages` | Reading articles + listening audio passages |
| `/admin/passages/new` | Create passage (with question builder inline) |
| `/admin/passages/[id]` | Edit passage + manage its questions |
| `/admin/school/classes` | School classes overview (card grid) |
| `/admin/school/classes/new` | Create class |
| `/admin/school/classes/[id]` | Edit class, manage enrolled students, assign tests |
| `/admin/school/students` | Enrolled students (many-to-many classes) |
| `/admin/school/students/new` | Add new enrolled student |
| `/admin/school/students/[id]` | Student profile, class enrollment, attendance history, portal account |
| `/admin/school/attendance` | Mark attendance per class per date |
| `/admin/guide` | Workflow guide (8-step create → publish → share) |

---

## Database Schema

### Core tables

```
questions
  id, section, type, level, question_text, passage_id,
  audio_url, option_a-d, correct_answer, fill_answer,
  explanation, topic_tags, active

passages
  id, title, type (reading|listening), level,
  content, audio_url, transcript, active

students                    ← entry-test takers / prospects
  id, full_name, phone, email,
  test_count, latest_band, last_test_at

test_sessions
  id, student_id, test_type, started_at, submitted_at,
  duration_sec, band_score, total_correct, total_questions,
  section_scores (JSONB), answers (JSONB),
  test_id, school_student_id

tests                       ← curated tests built by admin
  id, name, description, time_limit_sec, published, active

test_questions              ← many-to-many: tests ↔ questions
  test_id, question_id, order_index
```

### School management tables

```
classes
  id, name, level, teacher, schedule, room,
  max_students, start_date, end_date, status, notes

school_students             ← enrolled students (NOT the same as prospects)
  id, full_name, phone, email, date_of_birth,
  parent_name, parent_phone, enrollment_date,
  status (active|paused|graduated|dropped),
  notes, auth_user_id (→ auth.users)

student_classes             ← many-to-many: one student can attend multiple classes
  student_id, class_id, enrolled_at, status (active|completed|dropped)

attendance
  id, class_id, student_id, session_date,
  status (present|absent|late|excused), notes

class_tests                 ← assign tests to a class
  class_id, test_id, assigned_at, due_date, active
```

### Key database functions / views

- `public_questions` — view that exposes questions WITHOUT `correct_answer` (safe for anon clients)
- `calculate_band(correct, total)` — maps score to IELTS band string
- `submit_test(...)` — SECURITY DEFINER function: scores answers server-side, saves session, updates student stats. Accepts optional `p_test_id` and `p_school_student_id` to link results.

### RLS summary

| Table | Anon | Authenticated |
|---|---|---|
| questions | SELECT (active only) | ALL |
| passages | SELECT (active only) | ALL |
| public_questions (view) | SELECT | SELECT |
| students | INSERT | ALL |
| test_sessions | INSERT | ALL |
| tests | SELECT (published+active) | ALL |
| test_questions | SELECT (if test published) | ALL |
| classes, school_students, student_classes, attendance, class_tests | — | ALL |

---

## Authentication

### Admin panel
- Route: `/admin/*` (except `/admin/login`)
- Mechanism: SHA-256 hash of `ADMIN_PASSWORD + "happyhouse-admin-2025"` stored as `admin_session` cookie
- Checked in `middleware.ts` using Edge-compatible Web Crypto API

### Student portal
- Route: `/portal/*` (except `/portal/login`)
- Mechanism: Supabase Auth session (JWT cookie managed by `@supabase/ssr`)
- Login: phone number → converted to `{phone}@hh.local` as the email identifier
- Account created by admin on student detail page via `supabase.auth.admin.createUser()`

### Public test (`/test`, `/t/[id]`)
- No authentication required
- Students fill name + phone before starting
- Results saved to `students` table (upsert by phone) and `test_sessions`

---

## Key Architectural Patterns

### Supabase clients (3 variants)

```typescript
// Browser client — for client components, portal (uses session cookie)
import { createClient } from '@/lib/supabase/client'

// Server client — for server components + API routes (reads session cookie)
import { createClient } from '@/lib/supabase/server'

// Service client — bypasses RLS entirely (admin server actions only)
import { createServiceClient } from '@/lib/supabase/service'
```

**Rule:** Never use `createServiceClient()` in client components or expose it publicly.

### Test state management

The anonymous test flow (`/test`, `/t/[id]`) uses a React context (`lib/test-context.tsx`) with `useReducer`. Persists across pages (landing → test → result) within the same session.

Portal tests (`/portal/test/[id]`) are self-contained in `PortalTestClient` — no shared context needed since the student is already authenticated.

### Question grouping

Questions linked to the same `passage_id` must be displayed together (split-pane: passage left, questions right). `sortQuestionsForDisplay()` in `lib/test-utils.ts` ensures passage questions are always contiguous regardless of how they were ordered by the admin.

### Server actions pattern

All mutations use Next.js server actions (`'use server'`). Pages are server components that fetch data via `createServiceClient()`, then pass data to client components for interactivity.

```
page.tsx (server) → fetches data → ClientComponent (client)
                                  → calls server action on mutation
```

### Admin layout

All `/admin/*` pages share `app/admin/layout.tsx` which wraps content with `AdminSidebar` and a `<Toaster>` (sonner). The layout uses `h-screen overflow-hidden` so each page fills the viewport exactly. Individual pages use `flex flex-col h-full` with a fixed toolbar and scrollable body.

---

## Feature Areas

### 1. Entry Test (public)

Two modes: **Mini** (30 questions, grammar + vocab, 30 min) and **Full** (95 questions, all sections, 90 min).

Questions are shuffled server-side; standalone questions come first, then passage groups (reading/listening) in random order. Scoring happens server-side via `submit_test()` RPC — answers never go through client scoring.

Result shows: total score, per-section progress bars, collapsible "wrong answer review" with student answer vs correct answer.

### 2. Curated Tests (`/t/[id]`)

Admin builds a specific test in `/admin/tests/[id]`, picks questions from the bank (grouped by passage), optionally assigns a due date. Clicking "Publish" makes `/t/[testId]` accessible to anyone with the link.

These tests can also be assigned to school classes (`class_tests` table) so enrolled students see them in their portal.

### 3. Admin Question Bank

Questions have sections (grammar, vocabulary, reading, listening) and types (multiple_choice, true_false, fill_blank). Legacy types `reading` / `listening` are treated as `multiple_choice` in the UI — defined in `MULTIPLE_CHOICE_TYPES` constant.

Passages are separate entities. A reading passage has text content; a listening passage has an audio URL (stored in Supabase Storage bucket `audio`, max 50 MB, allowed: mp3/m4a/ogg/wav). Questions link to passages via `passage_id` FK.

### 4. School Management

Distinct from the entry-test "students" (prospects). Enrolled `school_students` have:
- Multiple class enrollments (`student_classes` junction — many-to-many)
- Attendance records per class per date
- A Supabase Auth account (created by admin, login via phone number)
- Access to the student portal

The sidebar separates **CRM & Entry Test** from **Quản lý học** (school management).

### 5. Student Portal (`/portal`)

After admin creates a portal account, students log in with phone + password at `/portal/login`. The portal:
- Shows all enrolled classes with schedule
- Lists tests assigned to any of their classes (deduplicated)
- Shows test results with score percentage
- Lets them take assigned tests (results saved with `school_student_id` for tracking)

---

## Terminology

| Vietnamese | English meaning |
|---|---|
| Ứng viên | Prospects / entry-test takers (NOT enrolled) |
| Học viên | Enrolled students |
| Lớp học | Class |
| Bài kiểm tra | Curated test |
| Bài đọc / Nghe | Reading / Listening passage |
| Câu hỏi | Question |
| Điểm danh | Attendance |
| Ngân hàng câu hỏi | Question bank |
| Kết quả | Results |
| Band IELTS | IELTS band score |

---

## Deployment (Vercel)

1. Connect `github.com/ptnam0700/happyhouse` to Vercel
2. Set **Root Directory = `web`** in Vercel project settings
3. Add all 5 environment variables in Vercel → Settings → Environment Variables
4. Deploy; after first deploy set `NEXT_PUBLIC_SITE_URL` to the actual domain and redeploy

The app is statically pre-rendered where possible. Dynamic routes (admin pages with DB queries) are server-rendered.

---

## File Naming Conventions

- `page.tsx` — server component (data fetching)
- `*Client.tsx` — client component (interactivity)
- `actions.ts` — server actions for that feature area
- `layout.tsx` — layout wrapper

---

## Common Gotchas

1. **RLS blocks anon for school tables.** Always use `createServiceClient()` in server components/actions when reading `school_students`, `classes`, `student_classes`, `attendance`. Using `createClient()` (anon) in client components will return empty results silently.

2. **`useActionState` requires `(_: unknown, formData: FormData)` signature.** All server actions used with `useActionState` must accept state as first param even if unused.

3. **Passage questions must be contiguous.** Always pass questions through `sortQuestionsForDisplay()` before rendering a test. Without it, the split-pane (passage left, questions right) won't work for interleaved question arrays.

4. **Phone → email for portal auth.** Student portal login converts phone `0901234567` to `0901234567@hh.local` as the Supabase Auth email. Never expose this mapping to users.

5. **Optimistic toggles.** Active/inactive toggles in admin lists use `useState` for immediate visual feedback and revert on server error. Don't add `disabled` that blocks the visual flip.
