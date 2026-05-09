import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourse, COURSES_DATA } from '@/lib/courses-data'
import type { Metadata } from 'next'
import { CheckCircle, Users, Clock, Award, ChevronLeft, Phone } from 'lucide-react'

export async function generateStaticParams() {
  return COURSES_DATA.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) return { title: 'Không tìm thấy khoá học' }
  const name = `${course.label} ${course.headline.filter(Boolean).join(' ')}`
  return {
    title:       `${name} | HappyHouse English Center`,
    description: course.summary,
    robots:      { index: true, follow: true },
  }
}

function darken(hex: string): string {
  const map: Record<string, string> = {
    '#E91E63': '#AD1457', '#F06292': '#C2185B',
    '#FFB74D': '#E65100', '#FB8C00': '#BF360C',
    '#9C27B0': '#6A1B9A', '#EC407A': '#AD1457',
  }
  return map[hex] ?? '#1A2744'
}

function lightBg(hex: string): string {
  const map: Record<string, string> = {
    '#E91E63': '#FCE4EC', '#F06292': '#FCE4EC',
    '#FFB74D': '#FFF8E1', '#FB8C00': '#FFF3E0',
    '#9C27B0': '#F3E5F5', '#EC407A': '#FCE4EC',
  }
  return map[hex] ?? '#F7F6F2'
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) notFound()

  const accent = course.bg
  const dark   = darken(accent)
  const softBg = lightBg(accent)
  const lines  = course.headline.filter(Boolean)

  return (
    <>
      <style>{`
        /* ── Course detail styles ── */
        .kh-body { font-family:'Be Vietnam Pro',sans-serif; color:#1A2744; background:#fff; min-height:100vh; }

        /* Back link */
        .kh-back { display:inline-flex; align-items:center; gap:6px; color:rgba(255,255,255,0.8);
          text-decoration:none; font-size:14px; font-weight:600; transition:color .2s; }
        .kh-back:hover { color:#fff; }

        /* Hero */
        .kh-hero { background:${accent}; position:relative; overflow:hidden; }
        .kh-hero::after { content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 60% 80% at 90% 60%,rgba(0,0,0,.12) 0%,transparent 60%);
          pointer-events:none; }
        .kh-hero-inner { max-width:1200px; margin:0 auto; padding:20px 24px 0; }
        .kh-hero-grid { max-width:1200px; margin:0 auto; padding:32px 24px 0;
          display:flex; align-items:flex-end; gap:40px; flex-wrap:wrap; }
        .kh-hero-text { flex:1; min-width:280px; padding-bottom:48px; position:relative; z-index:1; }
        .kh-hero-label { display:inline-block; background:rgba(255,255,255,.18); color:#fff;
          font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
          padding:4px 14px; border-radius:100px; margin-bottom:16px; }
        .kh-hero-h1 { font-weight:900; font-size:clamp(48px,8vw,80px); line-height:.95;
          color:#fff; margin:0 0 20px; letter-spacing:-1px; }
        .kh-hero-desc { font-size:17px; color:rgba(255,255,255,.88); line-height:1.65;
          max-width:520px; margin:0; }
        .kh-hero-photo { width:260px; height:300px; flex-shrink:0;
          background:${dark}; border-radius:20px 20px 0 0;
          display:flex; align-items:flex-end; justify-content:center;
          overflow:hidden; font-size:140px; line-height:1; position:relative; z-index:1; }
        .kh-hero-photo span { transform:translateY(12px);
          filter:drop-shadow(0 8px 16px rgba(0,0,0,.3)); }

        /* Stats bar */
        .kh-stats { background:${dark}; color:#fff; }
        .kh-stats-inner { max-width:1200px; margin:0 auto; padding:0 24px;
          display:flex; flex-wrap:wrap; }
        .kh-stat { flex:1 1 240px; padding:18px 24px;
          border-right:1px solid rgba(255,255,255,.15);
          display:flex; align-items:center; gap:12px; }
        .kh-stat:last-child { border-right:none; }
        .kh-stat-lbl { font-size:11px; font-weight:700; letter-spacing:.8px;
          text-transform:uppercase; opacity:.7; margin-bottom:2px; }
        .kh-stat-val { font-size:14px; font-weight:600; }

        /* Body grid */
        .kh-grid { max-width:1200px; margin:0 auto; padding:60px 24px 80px;
          display:grid; grid-template-columns:1fr 360px; gap:48px; align-items:start; }

        /* Section headings */
        .kh-sec-h2 { font-size:22px; font-weight:800; color:#1A2744;
          margin:0 0 24px; display:flex; align-items:center; gap:10px; }
        .kh-sec-bar { display:inline-block; width:4px; height:24px;
          background:${accent}; border-radius:2px; flex-shrink:0; }

        /* Content list */
        .kh-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px; }
        .kh-list-item { display:flex; align-items:flex-start; gap:12px;
          padding:14px 18px; background:${softBg}; border-radius:12px; }
        .kh-list-icon { color:${accent}; flex-shrink:0; margin-top:1px; }
        .kh-list-text { font-size:15px; line-height:1.6; color:#374151; }

        /* Commitment box */
        .kh-commit { background:${accent}; border-radius:16px; padding:24px 28px;
          display:flex; align-items:flex-start; gap:16px; margin-top:0; }
        .kh-commit-icon { color:#fff; flex-shrink:0; margin-top:2px; }
        .kh-commit-text { font-size:16px; font-weight:600; color:#fff; line-height:1.6; margin:0; }

        /* Sidebar card */
        .kh-card { background:#fff; border-radius:20px;
          box-shadow:0 4px 32px rgba(26,39,68,.12); border:1px solid #F3F4F6;
          overflow:hidden; position:sticky; top:24px; }
        .kh-card-head { background:${accent}; padding:28px 28px 24px; }
        .kh-card-head-lbl { color:rgba(255,255,255,.8); font-size:12px; font-weight:700;
          letter-spacing:1px; text-transform:uppercase; margin:0 0 6px; }
        .kh-card-head-title { color:#fff; font-size:32px; font-weight:900; line-height:.95; margin:0; }
        .kh-card-body { padding:24px 28px; display:flex; flex-direction:column; gap:16px; }
        .kh-card-row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
          padding-bottom:16px; border-bottom:1px solid #F3F4F6; }
        .kh-card-row-lbl { font-size:13px; color:#6B7280; font-weight:600; flex-shrink:0; }
        .kh-card-row-val { font-size:13px; color:#1A2744; font-weight:600; text-align:right; }

        /* CTA buttons */
        .kh-btn-primary { display:flex; align-items:center; justify-content:center; gap:8px;
          background:${accent}; color:#fff; border-radius:12px; padding:14px;
          font-weight:700; font-size:15px; text-decoration:none;
          transition:filter .2s, transform .2s;
          box-shadow:0 6px 20px ${accent}55; }
        .kh-btn-primary:hover { filter:brightness(.88); transform:translateY(-2px); }
        .kh-btn-secondary { display:flex; align-items:center; justify-content:center; gap:8px;
          background:${softBg}; color:${dark}; border-radius:12px; padding:12px;
          font-weight:700; font-size:14px; text-decoration:none; transition:filter .2s; }
        .kh-btn-secondary:hover { filter:brightness(.95); }

        /* Other courses */
        .kh-other-title { font-size:12px; font-weight:700; letter-spacing:.8px;
          text-transform:uppercase; color:#9CA3AF; margin:24px 0 12px; }
        .kh-other-list { display:flex; flex-direction:column; gap:8px; }
        .kh-other-link { display:flex; align-items:center; gap:10px;
          padding:10px 14px; border-radius:10px;
          background:#F9FAFB; text-decoration:none; transition:background .2s; }
        .kh-other-link:hover { background:${softBg}; }
        .kh-other-icon { width:28px; height:28px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; flex-shrink:0; }
        .kh-other-name { font-size:13px; font-weight:600; color:#1A2744; }

        /* Responsive */
        @media (max-width:860px) {
          .kh-grid { grid-template-columns:1fr; }
          .kh-hero-photo { display:none; }
          .kh-stat { flex:1 1 100%; border-right:none;
            border-bottom:1px solid rgba(255,255,255,.12); }
          .kh-stat:last-child { border-bottom:none; }
        }
        @media (max-width:600px) {
          .kh-hero-h1 { font-size:52px; }
          .kh-grid { padding:40px 16px 60px; }
        }
      `}</style>

      <div className="kh-body">

        {/* Hero */}
        <div className="kh-hero">
          <div className="kh-hero-inner">
            <Link href="/#courses" className="kh-back">
              <ChevronLeft size={16} aria-hidden="true" /> Tất cả chương trình
            </Link>
          </div>
          <div className="kh-hero-grid">
            <div className="kh-hero-text">
              <span className="kh-hero-label">{course.label}</span>
              <h1 className="kh-hero-h1">
                {lines.map((line, i) => <span key={i}>{line}{i < lines.length - 1 && <br />}</span>)}
              </h1>
              <p className="kh-hero-desc">{course.summary}</p>
            </div>

            {/* Placeholder photo — replace with real image */}
            <div className="kh-hero-photo" aria-hidden="true">
              {/*
                TODO: Replace this div with:
                <img src={course.photo} alt={course.photoAlt}
                     style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} />
                Expected: /public/images/courses/{slug}.png — transparent-bg portrait PNG
              */}
              <span>{course.placeholder}</span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="kh-stats">
          <div className="kh-stats-inner">
            {[
              { icon: <Users size={16} aria-hidden="true" />,  label: 'Đối tượng',  value: course.target    },
              { icon: <Clock size={16} aria-hidden="true" />,   label: 'Thời lượng', value: course.schedule  },
              { icon: <Users size={16} aria-hidden="true" />,  label: 'Sĩ số',      value: course.classSize },
            ].map((s, i) => (
              <div key={i} className="kh-stat">
                <span style={{ opacity: 0.7 }}>{s.icon}</span>
                <div>
                  <div className="kh-stat-lbl">{s.label}</div>
                  <div className="kh-stat-val">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="kh-grid">

          {/* Left */}
          <div>
            <section aria-labelledby="content-h" style={{ marginBottom: 48 }}>
              <h2 id="content-h" className="kh-sec-h2">
                <span className="kh-sec-bar" />
                Nội dung chương trình
              </h2>
              <ul className="kh-list">
                {course.contents.map((item, i) => (
                  <li key={i} className="kh-list-item">
                    <CheckCircle size={18} className="kh-list-icon" aria-hidden="true" />
                    <span className="kh-list-text">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="commit-h">
              <h2 id="commit-h" className="kh-sec-h2">
                <span className="kh-sec-bar" />
                Cam kết đầu ra
              </h2>
              <div className="kh-commit">
                <Award size={28} className="kh-commit-icon" aria-hidden="true" />
                <p className="kh-commit-text">{course.commitment}</p>
              </div>
            </section>
          </div>

          {/* Right: sticky card */}
          <aside>
            <div className="kh-card">
              <div className="kh-card-head">
                <p className="kh-card-head-lbl">{course.label}</p>
                <h3 className="kh-card-head-title">
                  {lines.map((line, i) => <span key={i}>{line}{i < lines.length - 1 && <br />}</span>)}
                </h3>
              </div>
              <div className="kh-card-body">
                {[
                  { label: 'Đối tượng',  val: course.target    },
                  { label: 'Lịch học',   val: course.schedule  },
                  { label: 'Sĩ số lớp', val: course.classSize },
                ].map(r => (
                  <div key={r.label} className="kh-card-row">
                    <span className="kh-card-row-lbl">{r.label}</span>
                    <span className="kh-card-row-val">{r.val}</span>
                  </div>
                ))}
                <a href="/#test-entry" className="kh-btn-primary">Đăng ký tư vấn miễn phí →</a>
                <a href="tel:0901234567" className="kh-btn-secondary">
                  <Phone size={15} aria-hidden="true" /> Gọi ngay: 0901 234 567
                </a>
              </div>
            </div>

            {/* Other courses */}
            <p className="kh-other-title">Chương trình khác</p>
            <div className="kh-other-list">
              {COURSES_DATA.filter(c => c.slug !== course.slug).map(c => (
                <Link key={c.slug} href={`/khoa-hoc/${c.slug}`} className="kh-other-link">
                  <span className="kh-other-icon" style={{ background: c.bg }} aria-hidden="true">
                    {c.placeholder}
                  </span>
                  <span className="kh-other-name">{c.label} {c.headline.filter(Boolean).join(' ')}</span>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </>
  )
}
