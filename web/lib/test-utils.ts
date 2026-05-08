import type { Question, TestType, TestResult, SectionScore } from '@/types'

/**
 * Ensures passage questions are contiguous — when we first encounter a
 * passage question we insert the entire group at that position.
 * Standalone questions keep their relative order.
 */
export function sortQuestionsForDisplay(questions: Question[]): Question[] {
  if (!questions.length) return questions

  // Build passage groups in the order they first appear
  const groups: Record<string, Question[]> = {}
  questions.forEach(q => {
    if (q.passageId) {
      if (!groups[q.passageId]) groups[q.passageId] = []
      groups[q.passageId].push(q)
    }
  })

  const inserted = new Set<string>()
  const result: Question[] = []

  for (const q of questions) {
    if (!q.passageId) {
      result.push(q)
    } else if (!inserted.has(q.passageId)) {
      inserted.add(q.passageId)
      result.push(...groups[q.passageId])
    }
    // Already inserted as part of group — skip
  }

  return result
}

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


export function mapServerScores(data: {
  sections?: Record<string, SectionScore>
  total_correct?: number
  total_questions?: number
  question_results?: Record<string, { is_correct: boolean; correct_answer: string | null; fill_answer: string | null }>
}): TestResult {
  return {
    sections:        data.sections ?? {},
    totalCorrect:    data.total_correct ?? 0,
    totalQ:          data.total_questions ?? 0,
    questionResults: data.question_results ?? {},
  }
}

export function subgroupInstruction(type: string, startNum: number, endNum: number): string {
  const range = startNum === endNum ? `Câu ${startNum}` : `Câu ${startNum}–${endNum}`
  if (type === 'true_false') return `${range} — Các câu sau là True hay False?`
  if (type === 'fill_blank') return `${range} — Điền một từ hoặc số vào chỗ trống.`
  // 'multiple_choice', 'reading', 'listening' all render as multiple choice
  return `${range} — Chọn đáp án đúng.`
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
