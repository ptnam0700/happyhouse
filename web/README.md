# HappyHouse English Center — Platform

Full-stack web platform for **HappyHouse English Center** (Hà Nội).  
Covers a marketing landing page, public IELTS placement tests, 6 course detail pages, a school management system (classes, enrolled students, attendance), a student portal, and a full admin dashboard.

**Contact:** 📞 0845 956 888 | CS1: Số 2 Hàm Từ Quan | CS2: Số 4 Ngõ 35 Phúc Lợi, Hà Nội

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
├── web/                    ← Next.js app (Vercel root)
│   ├── app/                ← All pages (App Router)
│   │   ├── page.tsx        ← Marketing landing page
│   │   ├── test/           ← Anonymous test engine
│   │   ├── result/         ← Anonymous test result
│   │   ├── t/[id]/         ← Curated public test link
│   │   ├── khoa-hoc/[slug] ← 6 course detail pages
│   │   ├── admin/          ← Full admin dashboard
│   │   └── portal/         ← Authenticated student area
│   ├── components/
│   │   ├── admin/          ← Admin UI components
│   │   ├── landing/        ← LandingPage, CoursesSection, RegisterForm…
│   │   ├── test/           ← QuestionCard, AudioPlayer, QuestionNavigator…
│   │   ├── result/         ← ResultView, ScoreCard…
│   │   └── ui/             ← shadcn primitives
│   ├── lib/
│   │   ├── supabase/       ← client.ts · server.ts · service.ts
│   │   ├── courses-data.ts ← All 6 course definitions
│   │   ├── test-context.tsx← useReducer context for anonymous test state
│   │   └── test-utils.ts   ← sortQuestionsForDisplay, mapServerScores…
│   ├── types/index.ts      ← All shared TypeScript interfaces
│   └── middleware.ts       ← Admin cookie + portal Supabase session
├── supabase/               ← SQL schema + migrations
├── docs.html               ← Full HTML documentation
└── landingpage.html        ← Original design reference (superseded)
```

---

## Environment Variables

File: `web/.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wvfbmfbfpqkqyeoirvpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # public/anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # service_role — server only, NEVER expose
ADMIN_PASSWORD=happyhouse2025          # admin panel login
NEXT_PUBLIC_SITE_URL=https://domain    # sitemap + OG tags
```

---

## Route Map

### Public routes

| URL | Description |
|---|---|
| `/` | Marketing landing page — hero, 6 course cards, teachers, results, testimonials, test entry form |
| `/khoa-hoc/[slug]` | Course detail page — 6 programs with full content, sticky sidebar CTA |
| `/test` | Anonymous test engine (mini/full placement test) |
| `/result` | Results after anonymous test — score, section bars, wrong-answer review |
| `/t/[testId]` | Curated shareable test — student registers then takes a specific published test |
| `/portal/login` | Student portal login (phone + password) |
| `/portal` | Student dashboard — enrolled classes, pending tests, results with retake |
| `/portal/test/[testId]` | Take an assigned test from the portal |
| `/portal/result/[sessionId]` | Full result review for any past attempt |

### Admin routes (`/admin/*`, password-protected)

| URL | Description |
|---|---|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Stats: prospects, sessions, band distribution, recent results |
| `/admin/students` | Ứng viên (entry-test prospects) — search, filter by band, inline edit, delete |
| `/admin/sessions` | All test submissions — filter by test name, type, band |
| `/admin/tests` | Curated test manager — create, publish, share link |
| `/admin/tests/new` | Full test editor with question picker grouped by passage |
| `/admin/tests/[id]` | Edit test, question picker, results panel (who submitted + scores) |
| `/admin/questions` | Question bank — search, section filter, active toggle, edit, delete |
| `/admin/questions/new` | Create standalone grammar/vocab question |
| `/admin/passages` | Reading & listening passages — search, filter, active toggle |
| `/admin/passages/new` | Full passage editor (deferred save) |
| `/admin/passages/[id]` | Edit passage + inline question builder |
| `/admin/school/classes` | School classes — card grid with enrollment bars |
| `/admin/school/classes/[id]` | Edit class, add students from list, assign tests, homework tracker |
| `/admin/school/students` | Enrolled học viên — many-to-many classes, search, filter |
| `/admin/school/students/[id]` | Student profile, class enrollment, attendance history, portal account |
| `/admin/school/attendance` | Mark attendance per class per date |
| `/admin/guide` | 8-step workflow guide |

---

## 6 Course Programs

Data in `web/lib/courses-data.ts`, detail pages at `/khoa-hoc/[slug]`.

| Slug | Program | Color | Target |
|---|---|---|---|
| `cambridge-tieu-hoc` | Cambridge · Tiểu học | `#E91E63` | Lớp 1–5 |
| `tieng-anh-tieu-hoc` | Tiếng Anh · Tiểu học | `#F06292` | Lớp 1–5 SGK |
| `tieng-anh-thcs-thpt` | Tiếng Anh · THCS & THPT | `#FFB74D` | Lớp 6–12 |
| `on-thi-vao-10` | Ôn thi · Vào 10 | `#FB8C00` | Lớp 9 |
| `on-thi-dai-hoc` | Ôn thi · Đại học | `#9C27B0` | Lớp 11–12 |
| `luyen-thi-ielts` | Luyện thi · IELTS | `#EC407A` | 15 tuổi+ |

**Course card photos:** replace placeholder emoji divs with `<img src="/images/courses/<slug>.png">` — transparent-bg PNG portraits, ~320×400px, HappyHouse coral polo shirt.

---

## Database Schema

### Core tables

```
questions        — section, type, level, passage_id, options, correct_answer (hidden from anon)
passages         — reading articles + listening audio (Supabase Storage bucket 'audio')
students         — entry-test takers / prospects (NOT enrolled students)
test_sessions    — submissions: answers JSONB, section_scores JSONB, test_id, school_student_id
tests            — curated tests built by admin
test_questions   — many-to-many: tests ↔ questions with order_index
```

### School management tables

```
classes          — name, level, teacher, schedule, room, status
school_students  — enrolled học viên, auth_user_id → auth.users
student_classes  — many-to-many: one student can attend multiple classes
attendance       — class_id, student_id, session_date, status
class_tests      — admin assigns tests to a class (portal students see them)
```

### Key DB functions

- `public_questions` — view hiding `correct_answer` from anon clients
- `calculate_band(correct, total)` — maps score to IELTS band string
- `submit_test(...)` — SECURITY DEFINER: scores server-side, saves session, returns `question_results`

---

## Authentication

### Admin panel
Cookie: SHA-256(`ADMIN_PASSWORD` + `"happyhouse-admin-2025"`) checked in `middleware.ts` (Edge-compatible).

### Student portal
Supabase Auth session. Login: phone → `{phone}@hh.local` email. Admin creates accounts via `supabase.auth.admin.createUser()` on student detail page.

### Public test
No auth. Name + phone collected before test; results saved to `students` (upsert by phone) + `test_sessions`.

---

## Supabase Clients — 3 Variants

```typescript
import { createClient }        from '@/lib/supabase/client'   // browser (portal/anon)
import { createClient }        from '@/lib/supabase/server'   // server components (reads session)
import { createServiceClient } from '@/lib/supabase/service'  // bypasses ALL RLS (admin only)
```

**Rule:** Never use `createServiceClient()` in client components. School tables (`school_students`, `classes`, `student_classes`, `attendance`) block anon — always use service client for these.

---

## Key Patterns

**Server/client split:** `page.tsx` (server, fetches via service client) → passes data to `*Client.tsx` (client, handles interaction + calls server actions).

**Passage grouping:** always call `sortQuestionsForDisplay(questions)` before rendering a test — ensures passage questions are contiguous for split-pane to work.

**Phone → portal auth:** `0901234567` → `0901234567@hh.local` for Supabase Auth. Handled by `phoneToEmail()` in `app/admin/school/actions.ts`.

**Optimistic toggles:** active/inactive switches flip UI immediately, revert on server error with `toast.error()`.

**Admin layout:** `h-screen overflow-hidden` root → every list page is `flex-col h-full` with fixed toolbar + scrollable body + `<Pagination />` footer.

---

## Terminology

| Vietnamese | English |
|---|---|
| Ứng viên | Prospects / entry-test takers (NOT enrolled) |
| Học viên | Enrolled students |
| Lớp học | Class |
| Bài kiểm tra | Curated test |
| Bài đọc / Nghe | Reading / Listening passage |
| Điểm danh | Attendance |
| Ngân hàng câu hỏi | Question bank |
| Ôn thi | Exam preparation |

---

## Common Gotchas

1. **RLS silently blocks school tables for anon.** Always `createServiceClient()` for school data.
2. **`useActionState` needs `(_: unknown, formData: FormData)` signature.**
3. **`sortQuestionsForDisplay()` before rendering any test** — without it split-pane breaks.
4. **Phone → email mapping** for portal auth — consistent between creation and login.
5. **Fill-blank inputs** — store raw value (spaces allowed); trim only at submission (`submit_test` RPC trims server-side).
6. **Audio stale across passages** — `key={passageId}` on `ListeningPanel` forces remount; `audio.load()` in `AudioPlayer` useEffect as backup.
7. **Student picker client-side exclusion** — server fetches all students, client filters out already-enrolled via `students.some(e => e.id === s.id)`.

---

## Deployment (Vercel)

1. Connect `github.com/ptnam0700/happyhouse` → Vercel
2. **Root Directory = `web`** in project settings
3. Add 5 env vars (Production + Preview + Development)
4. Deploy → get URL → update `NEXT_PUBLIC_SITE_URL` → redeploy

See `docs.html` at the repo root for the full interactive HTML documentation.
