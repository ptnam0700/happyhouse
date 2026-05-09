'use client'

import Link from 'next/link'

/**
 * HappyHouse — Courses Section
 * 6 programs: horizontal card layout, text left / photo right (bleeds to edge).
 *
 * PHOTOS: Each card references /images/courses/<slug>.png
 * Replace the placeholder <div> blocks with:
 *   <img src={course.photo} alt={course.photoAlt}
 *        className="hhc-photo-img" />
 * Photos should be transparent-background PNGs of HappyHouse teachers/students
 * in coral polo shirts. Recommended dimensions: 320×400px portrait.
 */

interface Course {
  id:          string
  label:       string
  headline:    string[]        // split over 2 lines
  bg:          string          // card solid background
  darkText?:   boolean         // true when bg is light (use dark typography)
  description: string
  photo:       string          // /images/courses/<slug>.png
  photoAlt:    string
  placeholder: string          // emoji shown until real photo is added
  placeholderBg: string        // slightly-tinted bg behind placeholder figure
  href:        string
}

const COURSES: Course[] = [
  {
    id:           'cambridge-tieu-hoc',
    label:        'Cambridge',
    headline:     ['TIỂU', 'HỌC'],
    bg:           '#E91E63',
    description:  'Chương trình Cambridge chuẩn quốc tế cho học sinh tiểu học (lớp 1–5). Phát triển toàn diện 4 kỹ năng theo khung tham chiếu YLE.',
    photo:        '/images/courses/cambridge-primary.png',
    photoAlt:     'Giáo viên HappyHouse hướng dẫn chương trình Cambridge tiểu học',
    placeholder:  '👩‍🏫',
    placeholderBg:'#c2185b',
    href:         '/khoa-hoc/cambridge-tieu-hoc',
  },
  {
    id:           'tieng-anh-tieu-hoc',
    label:        'Tiếng Anh',
    headline:     ['TIỂU', 'HỌC'],
    bg:           '#F06292',
    description:  'Tiếng Anh giao tiếp và học thuật cơ bản cho học sinh tiểu học. Phương pháp vui học, tự tin nói từ buổi đầu.',
    photo:        '/images/courses/english-primary.png',
    photoAlt:     'Học sinh tiểu học vui học tiếng Anh tại HappyHouse',
    placeholder:  '🧒',
    placeholderBg:'#e91e8c',
    href:         '/khoa-hoc/tieng-anh-tieu-hoc',
  },
  {
    id:           'tieng-anh-thcs-thpt',
    label:        'Tiếng Anh',
    headline:     ['THCS', 'THPT'],
    bg:           '#FFB74D',
    description:  'Bám sát chương trình SGK, nâng điểm phẩy 8+ trên lớp cho học sinh cấp 2 và cấp 3. Ôn tập bài tập theo dạng đề thi.',
    photo:        '/images/courses/english-secondary.png',
    photoAlt:     'Học sinh THCS THPT học tiếng Anh cùng HappyHouse',
    placeholder:  '🧑‍🎓',
    placeholderBg:'#f57c00',
    href:         '/khoa-hoc/tieng-anh-thcs-thpt',
  },
  {
    id:           'on-thi-vao-10',
    label:        'Ôn thi',
    headline:     ['VÀO', '10'],
    bg:           '#FB8C00',
    description:  'Lộ trình ôn thi vào lớp 10 chuyên Anh và trường công lập Hà Nội. Chiến lược làm bài, luyện đề sát đề chính thức.',
    photo:        '/images/courses/entrance-exam-10.png',
    photoAlt:     'Học sinh ôn thi vào lớp 10 tại HappyHouse',
    placeholder:  '📝',
    placeholderBg:'#e65100',
    href:         '/khoa-hoc/on-thi-vao-10',
  },
  {
    id:           'on-thi-dai-hoc',
    label:        'Ôn thi',
    headline:     ['ĐẠI', 'HỌC'],
    bg:           '#9C27B0',
    description:  'Ôn thi THPT Quốc Gia môn tiếng Anh, mục tiêu 8+ và 9, 10 điểm. Hệ thống ngữ pháp, từ vựng và đề thi bài bản.',
    photo:        '/images/courses/university-entrance.png',
    photoAlt:     'Học sinh ôn thi đại học môn tiếng Anh tại HappyHouse',
    placeholder:  '🎓',
    placeholderBg:'#6a1b9a',
    href:         '/khoa-hoc/on-thi-dai-hoc',
  },
  {
    id:           'luyen-thi-ielts',
    label:        'Luyện thi',
    headline:     ['IELTS', ''],
    bg:           '#EC407A',
    description:  'Lộ trình IELTS từ mất gốc đến target 7.0+, Foundation đến Advanced. Đội ngũ giáo viên 8.0+, lớp học nhỏ, feedback cá nhân.',
    photo:        '/images/courses/ielts.png',
    photoAlt:     'Giáo viên IELTS 8.5 HappyHouse hướng dẫn luyện thi',
    placeholder:  '🏆',
    placeholderBg:'#c2185b',
    href:         '/khoa-hoc/luyen-thi-ielts',
  },
]

interface Props {
  onEnroll?: (e: React.MouseEvent) => void
}

export function CoursesSection({ onEnroll }: Props) {
  return (
    <section id="courses" aria-label="Các chương trình học tiếng Anh">
      <style>{`
        .hhc-section {
          background: #FFF0F3;
          padding: 88px 0 100px;
        }
        .hhc-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── Header ── */
        .hhc-head { text-align: center; margin-bottom: 52px; }
        .hhc-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(233,30,99,0.09); border: 1px solid rgba(233,30,99,0.22);
          border-radius: 100px; padding: 5px 16px;
          font-size: 11.5px; font-weight: 700; letter-spacing: 1px;
          color: #E91E63; text-transform: uppercase; margin-bottom: 14px;
        }
        .hhc-title {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 800; font-size: 36px; line-height: 1.2;
          color: #E91E63; margin: 0 0 10px;
        }
        .hhc-subtitle {
          font-size: 15.5px; color: #6B7280;
          max-width: 560px; margin: 0 auto; line-height: 1.65;
        }

        /* ── Grid ── */
        .hhc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          list-style: none; margin: 0; padding: 0;
        }

        /* ── Card ── */
        .hhc-card {
          border-radius: 20px;
          overflow: hidden;
          min-height: 190px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          outline: none;
        }
        .hhc-card:hover  { transform: translateY(-5px); box-shadow: 0 18px 52px rgba(0,0,0,0.22); }
        .hhc-card:focus-within { box-shadow: 0 0 0 3px #E91E63, 0 12px 40px rgba(0,0,0,0.18); }

        /* ── Card link (fills entire card) ── */
        .hhc-link {
          display: flex; min-height: 190px;
          text-decoration: none; color: inherit;
          height: 100%;
        }
        .hhc-link:focus { outline: none; }

        /* ── Text side ── */
        .hhc-text {
          flex: 1; min-width: 0;
          padding: 28px 20px 28px 28px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .hhc-label {
          display: block;
          font-size: 11.5px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; margin-bottom: 5px;
        }
        .hhc-headline {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 900; font-size: 40px; line-height: 0.95;
          margin: 0; letter-spacing: -0.5px;
        }
        /* single-line headline (IELTS) */
        .hhc-headline-single { font-size: 44px; }

        .hhc-desc {
          font-size: 12.5px; line-height: 1.6;
          max-height: 0; overflow: hidden; opacity: 0;
          margin-top: 0;
          transition: max-height 0.38s ease, opacity 0.3s ease, margin-top 0.3s ease;
        }
        .hhc-card:hover .hhc-desc,
        .hhc-card:focus-within .hhc-desc {
          max-height: 90px; opacity: 1; margin-top: 12px;
        }

        /* ── Photo side ── */
        .hhc-photo {
          width: 42%; flex-shrink: 0;
          position: relative; overflow: hidden;
        }

        /* Real photo — swap placeholder div for this img */
        .hhc-photo-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          transition: transform 0.4s ease;
        }
        .hhc-card:hover .hhc-photo-img,
        .hhc-card:focus-within .hhc-photo-img { transform: scale(1.05); }

        /* ─── Placeholder (remove once real photos are added) ─── */
        .hhc-placeholder {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 0; overflow: hidden;
          transition: transform 0.4s ease;
        }
        .hhc-placeholder-emoji {
          font-size: 96px; line-height: 1;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
          transform: translateY(8px);
          user-select: none;
        }
        .hhc-card:hover .hhc-placeholder,
        .hhc-card:focus-within .hhc-placeholder {
          transform: scale(1.06) translateY(-4px);
        }

        /* ── CTA ── */
        .hhc-cta { text-align: center; margin-top: 44px; }
        .hhc-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #E91E63; color: #fff;
          padding: 13px 32px; border-radius: 12px;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700; font-size: 15px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 6px 20px rgba(233,30,99,0.35);
        }
        .hhc-cta-btn:hover { background: #c2185b; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(233,30,99,0.45); }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .hhc-grid { grid-template-columns: repeat(2,1fr); }
          .hhc-title { font-size: 30px; }
        }
        @media (max-width: 600px) {
          .hhc-section { padding: 64px 0 72px; }
          .hhc-grid { grid-template-columns: 1fr; }
          .hhc-title { font-size: 26px; }
          .hhc-headline { font-size: 36px; }
          .hhc-photo { width: 38%; }
        }
      `}</style>

      <div className="hhc-section">
        <div className="hhc-container">

          {/* Section header */}
          <header className="hhc-head">
            <p className="hhc-tag">Chương trình học</p>
            <h2 className="hhc-title">Các chương trình học tiếng Anh</h2>
            <p className="hhc-subtitle">
              Từ tiểu học đến luyện thi IELTS — HappyHouse có lộ trình phù hợp
              cho mọi lứa tuổi và mục tiêu học tập.
            </p>
          </header>

          {/* Cards */}
          <ol className="hhc-grid">
            {COURSES.map(course => {
              const textColor  = course.darkText ? '#1A2744' : '#fff'
              const labelAlpha = course.darkText ? 'rgba(26,39,68,0.7)' : 'rgba(255,255,255,0.82)'
              const descAlpha  = course.darkText ? 'rgba(26,39,68,0.75)' : 'rgba(255,255,255,0.88)'
              const isSingleLine = course.headline[1] === ''

              return (
                <li key={course.id} className="hhc-card" style={{ background: course.bg }}>
                  <Link href={course.href} className="hhc-link" aria-label={`${course.label} ${course.headline.join(' ')} — ${course.description}`}>

                    {/* Text */}
                    <div className="hhc-text">
                      <span className="hhc-label" style={{ color: labelAlpha }}>
                        {course.label}
                      </span>
                      <h3
                        className={`hhc-headline${isSingleLine ? ' hhc-headline-single' : ''}`}
                        style={{ color: textColor }}
                      >
                        {isSingleLine ? (
                          course.headline[0]
                        ) : (
                          <>{course.headline[0]}<br />{course.headline[1]}</>
                        )}
                      </h3>
                      <p className="hhc-desc" style={{ color: descAlpha }}>
                        {course.description}
                      </p>
                    </div>

                    {/* Photo — replace placeholder div with <img> once real assets are ready */}
                    <div className="hhc-photo" style={{ background: course.placeholderBg }}>
                      {/*
                        TODO: Replace this block with:
                        <img
                          src={course.photo}
                          alt={course.photoAlt}
                          className="hhc-photo-img"
                        />
                        Photo spec: transparent-bg PNG, portrait orientation ~320×400px
                        Teacher/student in HappyHouse coral polo shirt.
                        See /public/images/courses/ for file names.
                      */}
                      <div className="hhc-placeholder" aria-hidden="true">
                        <span className="hhc-placeholder-emoji" role="img" aria-label="">
                          {course.placeholder}
                        </span>
                      </div>
                    </div>

                  </Link>
                </li>
              )
            })}
          </ol>

          {/* CTA */}
          <div className="hhc-cta">
            <a
              className="hhc-cta-btn"
              href="#test-entry"
              onClick={onEnroll}
            >
              Kiểm tra trình độ & tư vấn khoá học →
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
