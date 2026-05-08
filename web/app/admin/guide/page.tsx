import type { Metadata } from 'next'
import {
  BookOpen, Headphones, GraduationCap, Globe, Share2,
  Users, CheckCircle, ChevronRight, MessageCircle, ClipboardList,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Hướng dẫn sử dụng' }

interface Step {
  num: number
  title: string
  desc: string
  path: string
  details: string[]
  tip?: string
  icon: React.ReactNode
  color: string
}

const STEPS: Step[] = [
  {
    num: 1,
    title: 'Tạo ngân hàng câu hỏi',
    desc: 'Thêm câu hỏi độc lập (Ngữ pháp, Từ vựng) vào hệ thống.',
    path: 'Admin → Câu hỏi → Thêm câu hỏi',
    icon: <BookOpen size={20} />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    details: [
      'Chọn phần: Ngữ pháp hoặc Từ vựng',
      'Chọn loại: Multiple Choice, True/False, hoặc Fill in Blank',
      'Chọn cấp độ: A1 → C2',
      'Nhập câu hỏi, các đáp án, và đáp án đúng',
      'Lưu — câu hỏi sẽ hiện trong danh sách với trạng thái Active',
    ],
    tip: 'Câu hỏi được đặt Active mới xuất hiện trong bài test. Bạn có thể ẩn câu hỏi cũ mà không cần xoá.',
  },
  {
    num: 2,
    title: 'Tạo bài đọc hoặc bài nghe',
    desc: 'Tạo passage và gắn câu hỏi — cần thiết cho phần Reading và Listening.',
    path: 'Admin → Bài đọc/Nghe → Tạo bài đọc / Tạo bài nghe',
    icon: <Headphones size={20} />,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    details: [
      'Chọn loại: Đọc hiểu hoặc Nghe hiểu',
      'Nhập tiêu đề và cấp độ',
      'Đọc hiểu: dán nội dung bài đọc vào ô text',
      'Nghe hiểu: tải file audio lên (.mp3 .m4a .wav) hoặc nhập URL',
      'Thêm câu hỏi vào bài ở panel bên phải — chọn loại và nhập nội dung',
      'Bấm "Tạo bài →" để lưu toàn bộ',
    ],
    tip: 'Một bài audio/đọc có thể có nhiều câu hỏi. Học viên thấy bài đọc/audio bên trái và câu hỏi bên phải — đúng format IELTS.',
  },
  {
    num: 3,
    title: 'Tạo bài kiểm tra',
    desc: 'Ghép các câu hỏi thành một bài test hoàn chỉnh với thời gian cố định.',
    path: 'Admin → Bài kiểm tra → Tạo bài test',
    icon: <GraduationCap size={20} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    details: [
      'Đặt tên bài test (VD: "IELTS Entry Test — Tháng 6/2025")',
      'Thêm mô tả ngắn nếu cần',
      'Chọn thời gian: 30 / 45 / 60 / 90 phút',
      'Bấm "Tạo & thêm câu hỏi →" để vào trang chỉnh sửa',
    ],
  },
  {
    num: 4,
    title: 'Thêm câu hỏi vào bài test',
    desc: 'Chọn câu hỏi từ ngân hàng, sắp xếp thứ tự theo ý muốn.',
    path: 'Trang chỉnh sửa bài test → Thêm câu hỏi',
    icon: <ClipboardList size={20} />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    details: [
      'Bấm "+ Thêm câu hỏi" để mở bộ chọn câu hỏi',
      'Lọc theo phần: Ngữ pháp / Từ vựng / Đọc hiểu / Nghe',
      'Tìm kiếm theo từ khoá nếu cần',
      'Tick chọn nhiều câu hỏi cùng lúc → bấm "Thêm X câu →"',
      'Dùng nút ↑ ↓ để sắp xếp lại thứ tự câu hỏi',
      'Xoá câu hỏi khỏi bài bằng icon thùng rác (không xoá khỏi ngân hàng)',
    ],
    tip: 'Câu hỏi thuộc cùng một bài đọc/nghe sẽ tự động hiển thị cùng nhau theo format split-pane khi học viên làm bài.',
  },
  {
    num: 5,
    title: 'Publish bài test',
    desc: 'Khi đã sẵn sàng, publish để tạo link chia sẻ.',
    path: 'Trang chỉnh sửa bài test → Bấm "Publish"',
    icon: <Globe size={20} />,
    color: 'bg-[#1A2744]/10 text-[#1A2744] border-[#1A2744]/20',
    details: [
      'Bấm nút xanh "Publish" ở góc trên phải',
      'Trạng thái chuyển từ 🔒 Draft → 🟢 Published',
      'Link chia sẻ xuất hiện ngay lập tức trong panel bên trái',
      'Bấm icon copy để sao chép link',
      'Có thể Ẩn (unpublish) bất kỳ lúc nào — link sẽ không còn truy cập được',
    ],
    tip: 'Link có dạng: happyhouseielts.com/t/[id]. Bài test có thể được publish và unpublish nhiều lần.',
  },
  {
    num: 6,
    title: 'Chia sẻ link cho học viên',
    desc: 'Gửi link qua bất kỳ kênh nào — Zalo, Facebook, email, QR code.',
    path: 'Copy link → Gửi qua Zalo / Messenger / Email',
    icon: <Share2 size={20} />,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    details: [
      'Gửi link trực tiếp qua Zalo, Facebook Messenger, email',
      'Tạo QR code từ link (dùng qr-code-generator.com hoặc tương đương)',
      'Đăng lên fanpage/group Facebook',
      'Nhúng vào trang web nếu muốn',
    ],
    tip: 'Học viên không cần tài khoản. Họ chỉ cần nhập Họ tên, Số điện thoại, Email (tuỳ chọn) là bắt đầu làm bài được ngay.',
  },
  {
    num: 7,
    title: 'Học viên làm bài',
    desc: 'Học viên truy cập link, đăng ký thông tin, và làm bài ngay trên trình duyệt.',
    path: 'happyhouseielts.com/t/[id]',
    icon: <Users size={20} />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    details: [
      'Học viên thấy tên bài test, mô tả, và thời gian',
      'Điền Họ tên + Số điện thoại → bấm "Tiếp theo →"',
      'Bài test bắt đầu với đồng hồ đếm ngược',
      'Tự động nộp bài khi hết giờ',
      'Kết quả hiển thị ngay sau khi nộp: Band score, điểm từng phần, gợi ý lộ trình',
    ],
    tip: 'Hoạt động tốt trên điện thoại — giao diện tự động thích ứng với màn hình nhỏ.',
  },
  {
    num: 8,
    title: 'Xem và theo dõi kết quả',
    desc: 'Tất cả kết quả được lưu tự động — xem theo học viên hoặc theo bài thi.',
    path: 'Admin → Học viên  hoặc  Admin → Bài thi',
    icon: <CheckCircle size={20} />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    details: [
      'Admin → Học viên: xem danh sách, band score gần nhất, số bài đã làm',
      'Click vào học viên: xem chi tiết từng lần thi, điểm từng kỹ năng',
      'Admin → Bài thi: xem tất cả bài nộp, lọc theo ngày / band / loại test',
      'Dashboard: thống kê tổng quan, phân bố band score',
    ],
    tip: 'Liên hệ tư vấn học viên dựa trên band score — những học viên dưới 4.5 cần được tư vấn lộ trình từ đầu.',
  },
]

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex gap-4 sm:gap-6">
      {/* Left: number line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 ${step.color}`}>
          {step.num}
        </div>
        {step.num < STEPS.length && (
          <div className="w-px flex-1 bg-gray-200 my-2" />
        )}
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-start gap-3 mb-2">
          <div className={`p-2 rounded-xl border ${step.color} shrink-0`}>
            {step.icon}
          </div>
          <div>
            <h3 className="font-bold text-[#1A2744] text-base leading-tight">
              Bước {step.num}: {step.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
          </div>
        </div>

        {/* Path */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-gray-100 rounded-lg px-3 py-1.5 mb-3 w-fit flex-wrap">
          <span>{step.path}</span>
        </div>

        {/* Detail list */}
        <ul className="space-y-1.5 mb-3">
          {step.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <ChevronRight size={14} className="text-gray-300 shrink-0 mt-0.5" />
              {d}
            </li>
          ))}
        </ul>

        {/* Tip */}
        {step.tip && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-xs text-amber-800">
            <span className="shrink-0 text-base leading-none">💡</span>
            <span>{step.tip}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2744] mb-2">
          Hướng dẫn tạo và chia sẻ bài kiểm tra
        </h1>
        <p className="text-sm text-gray-500">
          Từ lúc tạo câu hỏi đến khi học viên nhận được link và xem kết quả — 8 bước.
        </p>
      </div>

      {/* Quick summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Tạo câu hỏi',  sub: 'Ngân hàng câu hỏi',     icon: '📝' },
          { label: 'Tạo bài test', sub: 'Chọn câu hỏi + thời gian', icon: '📋' },
          { label: 'Publish',      sub: 'Tạo link chia sẻ',        icon: '🌐' },
          { label: 'Xem kết quả', sub: 'Dashboard & học viên',     icon: '📊' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(26,39,68,0.08)] text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xs font-bold text-[#1A2744]">{s.label}</div>
            <div className="text-[0.65rem] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div>
        {STEPS.map(step => <StepCard key={step.num} step={step} />)}
      </div>

      {/* Footer CTA */}
      <div className="bg-[#1A2744] rounded-2xl p-6 text-white text-center mt-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageCircle size={18} className="text-[#F5A623]" />
          <span className="font-bold">Cần hỗ trợ thêm?</span>
        </div>
        <p className="text-sm text-white/70">
          Liên hệ nhóm kỹ thuật HappyHouse nếu gặp vấn đề khi tạo bài hoặc xem kết quả.
        </p>
      </div>
    </div>
  )
}
