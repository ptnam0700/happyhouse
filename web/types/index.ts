export type Section = 'grammar' | 'vocabulary' | 'reading' | 'listening'
// 'reading' | 'listening' are legacy DB values — treated as multiple_choice in the UI
export type QuestionType = 'multiple_choice' | 'fill_blank' | 'true_false' | 'reading' | 'listening'

export const MULTIPLE_CHOICE_TYPES: QuestionType[] = ['multiple_choice', 'reading', 'listening']
export type TestType = 'full' | 'mini'
export type Answers = Record<string, string>

export interface Question {
  id: string
  section: Section
  type: QuestionType
  level: string
  question: string
  passageId: string | null
  passageTitle: string | null
  passageContent: string | null
  passageAudio: string | null
  audio: string | null
  options: string[]
}

export interface Student {
  name: string
  phone: string
  email: string
}

export interface SectionScore {
  correct: number
  total: number
}

export interface TeacherNote {
  text: string
  color: string
  icon: string
}

export interface TestResult {
  sections: Record<string, SectionScore>
  totalCorrect: number
  totalQ: number
  pct: number
  band: string
  bandLevel: string
  scaled: number
  teacherNote: TeacherNote
}

export interface TestState {
  student: Student
  testType: TestType
  questions: Question[]
  answers: Answers
  currentIndex: number
  startTime: Date | null
  timeLeft: number
  submitted: boolean
  result: TestResult | null
}
