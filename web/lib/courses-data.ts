export interface CourseData {
  slug:        string
  label:       string
  headline:    string[]
  bg:          string
  target:      string
  summary:     string
  contents:    string[]
  commitment:  string
  schedule:    string
  classSize:   string
  photo:       string
  photoAlt:    string
  placeholder: string
}

export const COURSES_DATA: CourseData[] = [
  {
    slug:      'cambridge-tieu-hoc',
    label:     'Cambridge',
    headline:  ['TIỂU', 'HỌC'],
    bg:        '#E91E63',
    target:    'Học sinh lớp 1–5 (6–11 tuổi)',
    summary:   'Chương trình tiếng Anh chuẩn Cambridge quốc tế, giúp con tự tin giao tiếp và đạt chứng chỉ Starters, Movers, Flyers.',
    contents: [
      'Phát triển toàn diện 4 kỹ năng: Nghe – Nói – Đọc – Viết theo khung Cambridge YLE',
      'Từ vựng và ngữ pháp theo chuẩn giáo trình Cambridge (Super Minds, Kid\'s Box)',
      'Luyện phát âm chuẩn với giáo viên người Việt giàu kinh nghiệm + trợ giảng',
      'Ôn luyện đề thi Cambridge Starters, Movers, Flyers',
    ],
    commitment: 'Đạt 12–15 khiên Cambridge / chứng chỉ YLE tương ứng cấp độ',
    schedule:   '2 buổi/tuần × 90 phút | Khóa 4–6 tháng',
    classSize:  'Tối đa 12 học viên/lớp',
    photo:      '/images/courses/cambridge-primary.png',
    photoAlt:   'Giáo viên HappyHouse hướng dẫn chương trình Cambridge tiểu học',
    placeholder:'👩‍🏫',
  },
  {
    slug:      'tieng-anh-tieu-hoc',
    label:     'Tiếng Anh',
    headline:  ['TIỂU', 'HỌC'],
    bg:        '#F06292',
    target:    'Học sinh lớp 1–5 chương trình SGK',
    summary:   'Bám sát chương trình tiếng Anh tiểu học của Bộ GD&ĐT, giúp con đạt điểm 9–10 trên lớp và yêu thích môn tiếng Anh.',
    contents: [
      'Bám sát SGK tiếng Anh tiểu học (Global Success, i-Learn Smart Start)',
      'Củng cố từ vựng – ngữ pháp – phát âm theo từng bài học trên lớp',
      'Luyện đề kiểm tra giữa kỳ, cuối kỳ',
      'Xây dựng nền tảng giao tiếp cơ bản qua hoạt động tương tác',
    ],
    commitment: 'Điểm trung bình môn tiếng Anh trên lớp đạt 8.5+',
    schedule:   '2 buổi/tuần × 90 phút | Khóa theo học kỳ',
    classSize:  'Tối đa 15 học viên/lớp',
    photo:      '/images/courses/english-primary.png',
    photoAlt:   'Học sinh tiểu học vui học tiếng Anh tại HappyHouse',
    placeholder:'🧒',
  },
  {
    slug:      'tieng-anh-thcs-thpt',
    label:     'Tiếng Anh',
    headline:  ['THCS', 'THPT'],
    bg:        '#FFB74D',
    target:    'Học sinh lớp 6–12',
    summary:   'Nâng điểm phẩy môn tiếng Anh trên lớp lên 8.0+, xây nền tảng vững chắc cho các kỳ thi quan trọng.',
    contents: [
      'Bám sát SGK tiếng Anh THCS & THPT (Global Success, Friends Plus)',
      'Hệ thống ngữ pháp từ cơ bản đến nâng cao theo cấp độ',
      'Mở rộng từ vựng theo chủ đề bài học và đề thi',
      'Rèn luyện kỹ năng làm bài kiểm tra 15 phút, 1 tiết, học kỳ',
      'Định hướng sớm cho thi vào 10 / THPT QG / IELTS',
    ],
    commitment: 'Điểm trung bình môn trên lớp 8.0+ sau 1 học kỳ',
    schedule:   '2 buổi/tuần × 90–120 phút | Khóa theo học kỳ',
    classSize:  'Tối đa 15 học viên/lớp',
    photo:      '/images/courses/english-secondary.png',
    photoAlt:   'Học sinh THCS THPT học tiếng Anh cùng HappyHouse',
    placeholder:'🧑‍🎓',
  },
  {
    slug:      'on-thi-vao-10',
    label:     'Ôn thi',
    headline:  ['VÀO', '10'],
    bg:        '#FB8C00',
    target:    'Học sinh lớp 9 chuẩn bị thi vào lớp 10 Hà Nội',
    summary:   'Lộ trình ôn thi chuyên sâu vào lớp 10 công lập và các trường chuyên Anh, bám sát cấu trúc đề thi Sở GD Hà Nội.',
    contents: [
      'Ôn tập toàn diện ngữ pháp – từ vựng – phát âm theo cấu trúc đề thi vào 10 Hà Nội',
      'Luyện 200+ đề thi thật và đề thi thử của các quận/huyện',
      'Chiến thuật làm bài: phân bổ thời gian, các dạng bẫy thường gặp',
      'Lộ trình 3 giai đoạn: nền tảng → nâng cao → luyện đề tăng tốc',
      'Thi thử định kỳ hàng tuần, có chấm và phản hồi cá nhân',
    ],
    commitment: 'Điểm thi vào 10 môn tiếng Anh đạt 8.5+',
    schedule:   '3 buổi/tuần × 120 phút | Khóa 6–9 tháng',
    classSize:  'Tối đa 15 học viên/lớp',
    photo:      '/images/courses/entrance-exam-10.png',
    photoAlt:   'Học sinh ôn thi vào lớp 10 tại HappyHouse',
    placeholder:'📝',
  },
  {
    slug:      'on-thi-dai-hoc',
    label:     'Ôn thi',
    headline:  ['ĐẠI', 'HỌC'],
    bg:        '#9C27B0',
    target:    'Học sinh lớp 11–12 chuẩn bị thi tốt nghiệp THPT QG',
    summary:   'Lộ trình ôn thi THPT Quốc Gia môn tiếng Anh, mục tiêu 8+, 9+ và chinh phục điểm 10.',
    contents: [
      'Phân tích ma trận đề thi THPT QG, 4 giai đoạn ôn thi khoa học',
      'Hệ thống đầy đủ chuyên đề ngữ pháp – từ vựng – phát âm – đọc hiểu',
      'Chiến thuật làm bài 50 câu trong 60 phút, xử lý câu phân loại 9–10',
      'Luyện 100+ đề thi thật và đề thi thử của các trường THPT chuyên',
      'Thi thử hàng tuần theo format chính thức của Bộ GD',
    ],
    commitment: 'Điểm thi THPT QG môn tiếng Anh đạt 8.5+',
    schedule:   '3 buổi/tuần × 120 phút | Khóa 6–10 tháng',
    classSize:  'Tối đa 12 học viên/lớp',
    photo:      '/images/courses/university-entrance.png',
    photoAlt:   'Học sinh ôn thi đại học môn tiếng Anh tại HappyHouse',
    placeholder:'🎓',
  },
  {
    slug:      'luyen-thi-ielts',
    label:     'Luyện thi',
    headline:  ['IELTS', ''],
    bg:        '#EC407A',
    target:    'Học sinh THPT, sinh viên, người đi làm (15 tuổi trở lên)',
    summary:   'Lộ trình IELTS bài bản từ mất gốc đến target 7.0+, phù hợp cho mục tiêu xét tuyển đại học, du học, định cư hoặc thăng tiến.',
    contents: [
      'Lộ trình 4 cấp độ: Foundation (0–3.5) → Pre-IELTS (3.5–5.0) → IELTS Intensive (5.0–6.5) → IELTS Advanced (6.5–7.5+)',
      'Đầy đủ 4 kỹ năng Listening – Reading – Writing – Speaking',
      'Giáo trình chính: Cambridge IELTS 1–18, Mindset for IELTS, IELTS Trainer',
      'Speaking 1-1 với giáo viên hàng tuần, chữa Writing chi tiết theo band descriptors',
      'Thi thử IELTS trên máy theo format chính thức của BC/IDP',
    ],
    commitment: 'Đạt band điểm cam kết theo từng cấp độ (có hợp đồng học lại miễn phí nếu không đạt)',
    schedule:   '3 buổi/tuần × 120 phút | Mỗi cấp độ 2.5–3 tháng',
    classSize:  'Tối đa 10 học viên/lớp',
    photo:      '/images/courses/ielts.png',
    photoAlt:   'Giáo viên IELTS 8.5 HappyHouse hướng dẫn luyện thi',
    placeholder:'🏆',
  },
]

export function getCourse(slug: string): CourseData | undefined {
  return COURSES_DATA.find(c => c.slug === slug)
}
