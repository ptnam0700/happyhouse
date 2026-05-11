'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, RotateCcw, ChevronRight, Gamepad2, BookOpen, Type } from 'lucide-react'
import { recordAnswer } from '../../actions'
import { cn } from '@/lib/utils'

interface Word { id: string; word: string; definition?: string; definition_vi?: string; example_sentence?: string; synonyms: string[]; pronunciation?: string; image_url?: string }
type Mode = 'picker' | 'flashcard' | 'quiz' | 'spelling' | 'done'

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

export function StudyClient({ collection, words, progressMap, studentId }: {
  collection: any; words: Word[]; progressMap: Record<string, any>; studentId: string
}) {
  const [mode, setMode]       = useState<Mode>('picker')
  const [deck, setDeck]       = useState<Word[]>([])
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<{ word: string; correct: boolean }[]>([])
  const [answer, setAnswer]   = useState('')
  const [quizChoice, setQuizChoice] = useState<string | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [, startTransition]   = useTransition()

  const current = deck[idx]

  const startMode = (m: 'flashcard' | 'quiz' | 'spelling') => {
    // Prioritise non-mastered, then fill with mastered
    const unmastered = shuffle(words.filter(w => (progressMap[w.id]?.status ?? 'new') !== 'mastered'))
    const d = unmastered.length >= 5 ? unmastered : shuffle(words)
    setDeck(d.slice(0, Math.min(20, d.length)))
    setIdx(0); setResults([]); setFlipped(false); setAnswer(''); setQuizChoice(null)
    if (m === 'quiz') buildOptions(d[0], d)
    setMode(m)
  }

  const buildOptions = (w: Word, pool: Word[]) => {
    const defs = pool.filter(p => p.id !== w.id && (p.definition_vi || p.definition))
      .map(p => p.definition_vi || p.definition || '')
      .filter(Boolean)
    const wrong = shuffle(defs).slice(0, 3)
    const correct = w.definition_vi || w.definition || ''
    setOptions(shuffle([correct, ...wrong]))
  }

  const recordAndAdvance = useCallback((correct: boolean) => {
    if (!current) return
    startTransition(() => recordAnswer(current.id, studentId, correct))
    setResults(prev => [...prev, { word: current.word, correct }])
    const next = idx + 1
    if (next >= deck.length) { setMode('done'); return }
    setIdx(next)
    setFlipped(false); setAnswer(''); setQuizChoice(null)
    if (mode === 'quiz') buildOptions(deck[next], deck)
  }, [current, idx, deck, mode, studentId])

  const checkSpelling = () => {
    if (!current) return
    const correct = answer.trim().toLowerCase() === current.word.toLowerCase()
    recordAndAdvance(correct)
  }

  const pct = results.length ? Math.round(results.filter(r => r.correct).length / results.length * 100) : 0

  // ── Mode picker ──────────────────────────────────────────────────
  if (mode === 'picker') return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header style={{ background: collection.color }} className="px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link href={`/portal/vocab/${collection.id}`} className="text-white/80 hover:text-white text-sm font-medium">← {collection.name}</Link>
        <span className="text-white font-bold">Chọn chế độ học</span>
      </header>
      <div className="max-w-lg mx-auto px-4 py-10 space-y-4">
        {[
          { m: 'flashcard' as const, icon: <BookOpen size={24} />, title: 'Thẻ ghi nhớ', desc: 'Xem từ → lật thẻ → đánh dấu thuộc / chưa thuộc' },
          { m: 'quiz'      as const, icon: <Gamepad2 size={24} />, title: 'Trắc nghiệm', desc: 'Xem từ → chọn 1 trong 4 nghĩa đúng' },
          { m: 'spelling'  as const, icon: <Type size={24} />,     title: 'Điền từ',     desc: 'Xem nghĩa → gõ từ đúng vào ô trống' },
        ].map(({ m, icon, title, desc }) => (
          <button key={m} onClick={() => startMode(m)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] hover:shadow-md transition-all text-left">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: collection.color }}>{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#1A2744]">{title}</div>
              <div className="text-sm text-gray-400 mt-0.5">{desc}</div>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </button>
        ))}
        <p className="text-center text-xs text-gray-400 pt-2">{words.length} từ · ưu tiên từ chưa thuộc</p>
      </div>
    </div>
  )

  // ── Done screen ──────────────────────────────────────────────────
  if (mode === 'done') {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4" style={{ background: collection.color }}>
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-[#1A2744] mb-1">{correct}/{results.length} đúng</h2>
        <p className="text-gray-400 mb-8">{pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Tốt lắm!' : 'Cố lên nhé!'}</p>
        <div className="space-y-2 w-full max-w-xs mb-8">
          {results.map((r, i) => (
            <div key={i} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium', r.correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
              {r.correct ? <CheckCircle size={15} /> : <XCircle size={15} />} {r.word}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => startMode(mode === 'done' ? 'flashcard' : mode as any)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: collection.color }}>
            <RotateCcw size={15} /> Học lại
          </button>
          <Link href={`/portal/vocab/${collection.id}`} className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-300 transition-colors">
            Về danh sách
          </Link>
        </div>
      </div>
    )
  }

  if (!current) return null
  const progress = `${idx + 1} / ${deck.length}`

  // ── Shared header ────────────────────────────────────────────────
  const GameHeader = () => (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <button onClick={() => setMode('picker')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(idx / deck.length) * 100}%`, background: collection.color }} />
        </div>
        <span className="text-xs text-gray-400 tabular-nums">{progress}</span>
      </div>
      <span className="text-sm font-bold text-emerald-600">{results.filter(r => r.correct).length} ✓</span>
    </div>
  )

  // ── Flashcard ────────────────────────────────────────────────────
  if (mode === 'flashcard') return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GameHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <button onClick={() => setFlipped(v => !v)}
          className="w-full max-w-sm min-h-[280px] bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,39,68,0.12)] flex flex-col items-center justify-center p-8 text-center cursor-pointer select-none transition-all active:scale-[0.98]"
          style={{ borderTop: `4px solid ${collection.color}` }}>
          {!flipped ? (
            <>
              <span className="text-3xl font-black text-[#1A2744] mb-2">{current.word}</span>
              {current.pronunciation && <span className="text-sm text-gray-400">{current.pronunciation}</span>}
              {current.image_url && <img src={current.image_url} alt="" className="w-24 h-24 rounded-xl object-cover mt-4" onError={e => (e.currentTarget.style.display='none')} />}
              <p className="text-xs text-gray-300 mt-6">Nhấn để xem nghĩa</p>
            </>
          ) : (
            <>
              {current.definition_vi && <p className="text-xl font-bold text-[#1A2744] mb-2">{current.definition_vi}</p>}
              {current.definition && <p className="text-sm text-gray-500 italic mb-3">{current.definition}</p>}
              {current.example_sentence && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2 mt-1">"{current.example_sentence}"</p>}
            </>
          )}
        </button>

        {flipped && (
          <div className="flex gap-3 mt-6 w-full max-w-sm">
            <button onClick={() => recordAndAdvance(false)}
              className="flex-1 h-14 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
              <XCircle size={18} /> Chưa thuộc
            </button>
            <button onClick={() => recordAndAdvance(true)}
              className="flex-1 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
              <CheckCircle size={18} /> Đã thuộc
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // ── Multiple choice quiz ─────────────────────────────────────────
  if (mode === 'quiz') {
    const correctAnswer = current.definition_vi || current.definition || ''
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <GameHeader />
        <div className="flex-1 flex flex-col px-4 pb-8 max-w-lg mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,39,68,0.12)] p-6 mt-4 text-center" style={{ borderTop: `4px solid ${collection.color}` }}>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Từ này có nghĩa là gì?</p>
            <span className="text-3xl font-black text-[#1A2744]">{current.word}</span>
            {current.pronunciation && <p className="text-sm text-gray-400 mt-1">{current.pronunciation}</p>}
          </div>
          <div className="space-y-3 mt-4">
            {options.map((opt, i) => {
              const isCorrect = opt === correctAnswer
              const chosen = quizChoice === opt
              let style = 'bg-white border-2 border-gray-200 text-[#1A2744]'
              if (quizChoice) {
                if (isCorrect) style = 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800'
                else if (chosen) style = 'bg-red-50 border-2 border-red-400 text-red-700'
                else style = 'bg-white border-2 border-gray-100 text-gray-400'
              }
              return (
                <button key={i} disabled={!!quizChoice} onClick={() => {
                  setQuizChoice(opt)
                  setTimeout(() => recordAndAdvance(isCorrect), 800)
                }} className={`w-full p-4 rounded-2xl text-sm font-medium text-left transition-all ${style}`}>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Spelling ─────────────────────────────────────────────────────
  if (mode === 'spelling') return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GameHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(26,39,68,0.12)] p-6 w-full text-center mb-5" style={{ borderTop: `4px solid ${collection.color}` }}>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Gõ từ tiếng Anh có nghĩa là:</p>
          {current.definition_vi && <p className="text-xl font-bold text-[#1A2744] mb-1">{current.definition_vi}</p>}
          {current.definition && <p className="text-sm text-gray-500 italic">{current.definition}</p>}
          {current.example_sentence && <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2 mt-3">"{current.example_sentence.replace(new RegExp(current.word, 'gi'), '___')}"</p>}
        </div>
        <input
          value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && answer.trim() && checkSpelling()}
          placeholder="Gõ từ vào đây..."
          autoFocus
          className="w-full h-14 text-center text-xl font-bold rounded-2xl border-2 border-gray-200 focus:border-[#E8303A] focus:outline-none text-[#1A2744] tracking-widest"
        />
        <button onClick={checkSpelling} disabled={!answer.trim()}
          className="w-full h-12 mt-3 rounded-2xl font-bold text-white transition-colors disabled:opacity-40"
          style={{ background: collection.color }}>
          Kiểm tra →
        </button>
        <button onClick={() => recordAndAdvance(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">Bỏ qua</button>
      </div>
    </div>
  )

  return null
}
