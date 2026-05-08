import type { Question, TestType, TestResult, TeacherNote, SectionScore } from '@/types'

export const SECTION_LABELS: Record<string, string> = {
  grammar: 'NGỮ PHÁP',
  listening: 'NGHE HIỂU',
  reading: 'ĐỌC HIỂU',
  vocabulary: 'TỪ VỰNG',
}

export const SECTION_NAMES: Record<string, string> = {
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng',
  reading: 'Đọc',
  listening: 'Nghe',
}

export const Q_NAV_SECTION_NAMES: Record<string, string> = {
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng',
  reading: 'Đọc',
  listening: 'Nghe',
}

export const LEVEL_MESSAGES: Record<string, string> = {
  advanced: 'Trình độ cao – Sẵn sàng chinh phục IELTS thực tế',
  upper_intermediate: 'Trên trung cấp – Mục tiêu IELTS 6.0+',
  intermediate: 'Trung cấp – Cần phát triển thêm các kỹ năng',
  elementary: 'Sơ cấp – Cần củng cố kiến thức nền',
  beginner: 'Người mới bắt đầu – Cần học từ nền tảng cơ bản',
}

export function getGroupStart(questions: Question[], idx: number): number {
  const q = questions[idx]
  if (!q || !q.passageId) return idx
  let i = idx
  while (i > 0 && questions[i - 1].passageId === q.passageId) i--
  return i
}

export function getGroupEnd(questions: Question[], idx: number): number {
  const q = questions[idx]
  if (!q || !q.passageId) return idx
  let i = idx
  while (i < questions.length - 1 && questions[i + 1].passageId === q.passageId) i++
  return i
}

export function getBand(correct: number, total: number): { band: string; level: string } {
  if (total === 0) return { band: 'Below 3.5', level: 'beginner' }
  const scaled = Math.round((correct / total) * 30)
  if (scaled >= 27) return { band: '6.5 – 7.0', level: 'advanced' }
  if (scaled >= 23) return { band: '5.5 – 6.0', level: 'upper_intermediate' }
  if (scaled >= 18) return { band: '4.5 – 5.0', level: 'intermediate' }
  if (scaled >= 13) return { band: '3.5 – 4.0', level: 'elementary' }
  return { band: 'Below 3.5', level: 'beginner' }
}

export function getTeacherNote(correct: number, total: number): TeacherNote {
  const scaled = total > 0 ? Math.round((correct / total) * 30) : 0
  if (scaled >= 25) return { text: 'Có thể vào lớp IELTS 6.0+', color: '#10B981', icon: '🎯' }
  if (scaled >= 20) return { text: 'Nên học Pre-IELTS / Foundation', color: '#F5A623', icon: '📘' }
  return { text: 'Cần củng cố Grammar + Vocabulary cơ bản', color: '#E8303A', icon: '📝' }
}

export function mapServerScores(data: {
  sections?: Record<string, SectionScore>
  total_correct?: number
  total_questions?: number
  band?: string
}): TestResult {
  const sections = data.sections ?? {}
  const totalCorrect = data.total_correct ?? 0
  const totalQ = data.total_questions ?? 0
  const pct = totalQ > 0 ? totalCorrect / totalQ : 0
  const band = data.band ?? 'Below 3.5'

  const levelMap: Record<string, string> = {
    'Below 3.5': 'beginner',
    '3.5 – 4.0': 'elementary',
    '4.5 – 5.0': 'intermediate',
    '5.5 – 6.0': 'upper_intermediate',
    '6.5 – 7.0': 'advanced',
  }

  return {
    sections,
    totalCorrect,
    totalQ,
    pct,
    band,
    bandLevel: levelMap[band] ?? 'beginner',
    scaled: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 30) : 0,
    teacherNote: getTeacherNote(totalCorrect, totalQ),
  }
}

export function subgroupInstruction(type: string, startNum: number, endNum: number): string {
  const range = startNum === endNum ? `Câu ${startNum}` : `Câu ${startNum}–${endNum}`
  if (type === 'true_false') return `${range} — Các câu sau là True hay False?`
  if (type === 'fill_blank') return `${range} — Điền một từ hoặc số vào chỗ trống.`
  if (type === 'multiple_choice') return `${range} — Chọn đáp án đúng.`
  return range
}

export async function loadQuestions(testType: TestType, supabase: ReturnType<typeof import('./supabase/client').createClient>): Promise<Question[]> {
  let query = supabase
    .from('public_questions')
    .select('id, section, type, level, question_text, passage_id, passage_title, passage_content, passage_audio_url, question_audio_url, option_a, option_b, option_c, option_d')

  if (testType === 'mini') {
    query = query.in('section', ['grammar', 'vocabulary'])
  }

  const { data, error } = await query
  if (error) throw error

  const standalone = data.filter((q: any) => !q.passage_id)
  const passageQs  = data.filter((q: any) =>  q.passage_id)

  standalone.sort(() => Math.random() - 0.5)

  const groups: Record<string, any[]> = {}
  passageQs.forEach((q: any) => {
    if (!groups[q.passage_id]) groups[q.passage_id] = []
    groups[q.passage_id].push(q)
  })
  const groupOrder = Object.keys(groups).sort(() => Math.random() - 0.5)
  const ordered: any[] = []
  groupOrder.forEach(k => ordered.push(...groups[k]))

  const combined = [...standalone, ...ordered]
  const limit = testType === 'mini' ? 30 : 95

  return combined.slice(0, limit).map((q: any) => ({
    id:             q.id,
    section:        q.section,
    type:           q.type,
    level:          q.level,
    question:       q.question_text,
    passageId:      q.passage_id      ?? null,
    passageTitle:   q.passage_title   ?? null,
    passageContent: q.passage_content ?? null,
    passageAudio:   q.passage_audio_url ?? null,
    audio:          q.question_audio_url ?? null,
    options:        [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
  }))
}
