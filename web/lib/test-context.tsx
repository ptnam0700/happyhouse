'use client'

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { TestState, TestType, Student, Question, Answers, TestResult } from '@/types'

const initialState: TestState = {
  student: { name: '', phone: '', email: '' },
  testType: 'full',
  questions: [],
  answers: {},
  currentIndex: 0,
  startTime: null,
  timeLeft: 0,
  submitted: false,
  result: null,
}

type Action =
  | { type: 'SET_STUDENT'; payload: Student }
  | { type: 'SET_TEST_TYPE'; payload: TestType }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_ANSWER'; payload: { qid: string; value: string } }
  | { type: 'REMOVE_ANSWER'; payload: string }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'START_TEST'; payload: { questions: Question[]; timeLeft: number } }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_RESULT'; payload: TestResult }
  | { type: 'RESET' }

function reducer(state: TestState, action: Action): TestState {
  switch (action.type) {
    case 'SET_STUDENT':
      return { ...state, student: action.payload }
    case 'SET_TEST_TYPE':
      return { ...state, testType: action.payload }
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload }
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.payload.qid]: action.payload.value } }
    case 'REMOVE_ANSWER': {
      const { [action.payload]: _, ...rest } = state.answers
      return { ...state, answers: rest }
    }
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload }
    case 'START_TEST':
      return {
        ...state,
        questions: action.payload.questions,
        answers: {},
        currentIndex: 0,
        startTime: new Date(),
        timeLeft: action.payload.timeLeft,
        submitted: false,
        result: null,
      }
    case 'TICK_TIMER':
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) }
    case 'SET_RESULT':
      return { ...state, submitted: true, result: action.payload }
    case 'RESET':
      return { ...initialState, student: state.student }
    default:
      return state
  }
}

interface TestContextValue {
  state: TestState
  setStudent: (s: Student) => void
  setTestType: (t: TestType) => void
  setAnswer: (qid: string, value: string) => void
  removeAnswer: (qid: string) => void
  setCurrentIndex: (i: number) => void
  startTest: (questions: Question[], timeLeft: number) => void
  tickTimer: () => void
  setResult: (r: TestResult) => void
  reset: () => void
}

const TestContext = createContext<TestContextValue | null>(null)

export function TestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setStudent = useCallback((s: Student) => dispatch({ type: 'SET_STUDENT', payload: s }), [])
  const setTestType = useCallback((t: TestType) => dispatch({ type: 'SET_TEST_TYPE', payload: t }), [])
  const setAnswer = useCallback((qid: string, value: string) => dispatch({ type: 'SET_ANSWER', payload: { qid, value } }), [])
  const removeAnswer = useCallback((qid: string) => dispatch({ type: 'REMOVE_ANSWER', payload: qid }), [])
  const setCurrentIndex = useCallback((i: number) => dispatch({ type: 'SET_CURRENT_INDEX', payload: i }), [])
  const startTest = useCallback((questions: Question[], timeLeft: number) => dispatch({ type: 'START_TEST', payload: { questions, timeLeft } }), [])
  const tickTimer = useCallback(() => dispatch({ type: 'TICK_TIMER' }), [])
  const setResult = useCallback((r: TestResult) => dispatch({ type: 'SET_RESULT', payload: r }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return (
    <TestContext.Provider value={{ state, setStudent, setTestType, setAnswer, removeAnswer, setCurrentIndex, startTest, tickTimer, setResult, reset }}>
      {children}
    </TestContext.Provider>
  )
}

export function useTest() {
  const ctx = useContext(TestContext)
  if (!ctx) throw new Error('useTest must be used inside TestProvider')
  return ctx
}
