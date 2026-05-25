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

// Target number of questions per section per test type
const SECTION_TARGETS: Record<string, Record<string, number>> = {
  mini: { grammar: 16, vocabulary: 14 },
  full: { grammar: 28, vocabulary: 24, reading: 24, listening: 19 },
}

// Desired level distribution across any section pool (must sum to 1)
const LEVEL_RATIO: Record<string, number> = {
  A1: 0.05, A2: 0.20, B1: 0.35, B2: 0.25, C1: 0.12, C2: 0.03,
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Pick `n` items from `pool` with level-balanced distribution.
// Falls back to filling remaining slots from whatever is left if a level is short.
function pickBalanced(pool: any[], n: number): any[] {
  if (pool.length <= n) return shuffle(pool)

  const byLevel: Record<string, any[]> = {}
  LEVELS.forEach(l => { byLevel[l] = [] })
  pool.forEach(q => {
    const l = q.level ?? 'B1'
    ;(byLevel[l] = byLevel[l] ?? []).push(q)
  })
  LEVELS.forEach(l => { byLevel[l] = shuffle(byLevel[l]) })

  const picked: any[] = []
  const leftover: any[] = []
  LEVELS.forEach(l => {
    const want = Math.round(LEVEL_RATIO[l] * n)
    picked.push(...byLevel[l].slice(0, want))
    leftover.push(...byLevel[l].slice(want))
  })

  if (picked.length < n) {
    picked.push(...shuffle(leftover).slice(0, n - picked.length))
  }
  return picked.slice(0, n)
}

export async function loadQuestions(testType: TestType, supabase: ReturnType<typeof import('./supabase/client').createClient>): Promise<Question[]> {
  const sections = testType === 'mini'
    ? ['grammar', 'vocabulary']
    : ['grammar', 'vocabulary', 'reading', 'listening']

  const { data, error } = await supabase
    .from('public_questions')
    .select('id, section, type, level, question_text, passage_id, passage_title, passage_content, passage_audio_url, question_audio_url, option_a, option_b, option_c, option_d')
    .in('section', sections)
  if (error) throw error

  const all = data ?? []
  const targets = SECTION_TARGETS[testType]
  const result: any[] = []

  for (const section of sections) {
    const pool     = all.filter((q: any) => q.section === section)
    const target   = targets[section] ?? 0
    const standalone = pool.filter((q: any) => !q.passage_id)
    const passageQs  = pool.filter((q: any) =>  q.passage_id)

    if (passageQs.length > 0) {
      // Group by passage, pick level-balanced groups until target is met
      const groups: Record<string, any[]> = {}
      passageQs.forEach((q: any) => {
        if (!groups[q.passage_id]) groups[q.passage_id] = []
        groups[q.passage_id].push(q)
      })
      const groupList = shuffle(Object.values(groups))
      const picked: any[] = []
      for (const g of groupList) {
        if (picked.length >= target) break
        picked.push(...g)
      }
      // Mix in any standalone questions from the same section if under target
      const remaining = target - picked.length
      if (remaining > 0) picked.push(...pickBalanced(standalone, remaining))
      result.push(...picked.slice(0, target))
    } else {
      result.push(...pickBalanced(standalone, target))
    }
  }

  return result.map((q: any) => ({
    id:             q.id,
    section:        q.section,
    type:           q.type,
    level:          q.level,
    question:       q.question_text,
    passageId:      q.passage_id       ?? null,
    passageTitle:   q.passage_title    ?? null,
    passageContent: q.passage_content  ?? null,
    passageAudio:   q.passage_audio_url ?? null,
    audio:          q.question_audio_url ?? null,
    options:        [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
  }))
}
