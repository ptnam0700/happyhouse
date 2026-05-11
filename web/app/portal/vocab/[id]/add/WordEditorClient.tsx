'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Sparkles, ExternalLink, X, Plus } from 'lucide-react'
import { upsertWord } from '../../actions'

interface Props { collection: { id: string; name: string; color: string }; initialWord?: any }

const PARTS_OF_SPEECH = ['noun','verb','adjective','adverb','phrase','idiom','preposition','conjunction','other']

export function WordEditorClient({ collection, initialWord }: Props) {
  const [pending, startTransition] = useTransition()
  const [looking, setLooking] = useState(false)

  const [word,       setWord]       = useState(initialWord?.word ?? '')
  const [pron,       setPron]       = useState(initialWord?.pronunciation ?? '')
  const [pos,        setPos]        = useState(initialWord?.part_of_speech ?? '')
  const [def,        setDef]        = useState(initialWord?.definition ?? '')
  const [defVi,      setDefVi]      = useState(initialWord?.definition_vi ?? '')
  const [example,    setExample]    = useState(initialWord?.example_sentence ?? '')
  const [exampleVi,  setExampleVi]  = useState(initialWord?.example_sentence_vi ?? '')
  const [synonyms,   setSynonyms]   = useState<string[]>(initialWord?.synonyms ?? [])
  const [antonyms,   setAntonyms]   = useState<string[]>(initialWord?.antonyms ?? [])
  const [related,    setRelated]    = useState<string[]>(initialWord?.related_words ?? [])
  const [imageUrl,   setImageUrl]   = useState(initialWord?.image_url ?? '')
  const [notes,      setNotes]      = useState(initialWord?.notes ?? '')
  const [difficulty, setDifficulty] = useState(initialWord?.difficulty ?? 'medium')
  const [tagInput,   setTagInput]   = useState('')
  const [tags,       setTags]       = useState<string[]>(initialWord?.tags ?? [])

  // Auto-lookup from Free Dictionary API
  const lookupWord = async () => {
    if (!word.trim()) return
    setLooking(true)
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      const entry = data[0]

      // Pronunciation
      const phonetic = entry.phonetic ?? entry.phonetics?.find((p: any) => p.text)?.text ?? ''
      if (phonetic && !pron) setPron(phonetic)

      // First meaning
      const meaning = entry.meanings?.[0]
      if (meaning) {
        if (!pos) setPos(meaning.partOfSpeech ?? '')
        const firstDef = meaning.definitions?.[0]
        if (firstDef) {
          if (!def) setDef(firstDef.definition ?? '')
          if (!example) setExample(firstDef.example ?? '')
        }
        // Collect all synonyms/antonyms across meanings
        const allSynonyms = entry.meanings.flatMap((m: any) => [
          ...(m.synonyms ?? []),
          ...(m.definitions?.flatMap((d: any) => d.synonyms ?? []) ?? []),
        ]).filter(Boolean).slice(0, 6)
        const allAntonyms = entry.meanings.flatMap((m: any) => [
          ...(m.antonyms ?? []),
          ...(m.definitions?.flatMap((d: any) => d.antonyms ?? []) ?? []),
        ]).filter(Boolean).slice(0, 4)
        if (!synonyms.length && allSynonyms.length) setSynonyms([...new Set(allSynonyms)] as string[])
        if (!antonyms.length && allAntonyms.length) setAntonyms([...new Set(allAntonyms)] as string[])
      }
    } catch { /* word not in free dictionary */ }
    setLooking(false)
  }

  const openAI = () => {
    const prompt = encodeURIComponent(`Define the English word "${word.trim()}". Please provide:\n1. IPA pronunciation\n2. Part of speech\n3. Clear English definition\n4. Vietnamese translation (nghĩa tiếng Việt)\n5. Example sentence\n6. Vietnamese translation of the example\n7. 5 synonyms\n8. 3 antonyms\n9. Related word forms (word family)`)
    window.open(`https://chat.openai.com/?q=${prompt}`, '_blank')
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput('') }
  }

  const handleSubmit = () => {
    if (!word.trim()) return
    startTransition(() => upsertWord(collection.id, {
      id: initialWord?.id, word, pronunciation: pron, part_of_speech: pos,
      definition: def, definition_vi: defVi, example_sentence: example,
      example_sentence_vi: exampleVi, synonyms, antonyms, related_words: related,
      image_url: imageUrl, notes, difficulty, tags,
    }))
  }

  const TagInput = ({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) => {
    const [inp, setInp] = useState('')
    const add = () => { const t = inp.trim(); if (t && !values.includes(t)) { onChange([...values, t]); setInp('') } }
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[44px]">
          {values.map(v => (
            <span key={v} className="flex items-center gap-1 text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-[#1A2744]">
              {v} <button onClick={() => onChange(values.filter(x => x !== v))} className="text-gray-300 hover:text-red-500"><X size={10} /></button>
            </span>
          ))}
          <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="Nhập rồi Enter..."
            className="flex-1 min-w-[100px] bg-transparent outline-none text-xs placeholder:text-gray-300" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header style={{ background: collection.color }} className="px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link href={`/portal/vocab/${collection.id}`} className="text-white/80 hover:text-white text-sm font-medium transition-colors">
          ← {collection.name}
        </Link>
        <span className="text-white font-bold">{initialWord ? 'Chỉnh sửa từ' : 'Thêm từ mới'}</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Word + lookup */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Từ vựng</h2>
          <div className="flex gap-2">
            <input value={word} onChange={e => setWord(e.target.value)} placeholder="Nhập từ vựng..."
              className="flex-1 h-12 px-4 rounded-xl border border-gray-200 text-lg font-bold text-[#1A2744] focus:outline-none focus:border-[#E8303A]" />
            <button onClick={lookupWord} disabled={!word.trim() || looking}
              title="Tra tự động (Free Dictionary)"
              className="flex items-center gap-1.5 h-12 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition-colors disabled:opacity-40">
              <Sparkles size={15} /> {looking ? '...' : 'Tra từ'}
            </button>
            <button onClick={openAI} disabled={!word.trim()} title="Hỏi ChatGPT"
              className="flex items-center gap-1.5 h-12 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold transition-colors disabled:opacity-40">
              <ExternalLink size={14} /> AI
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Phiên âm IPA</label>
              <input value={pron} onChange={e => setPron(e.target.value)} placeholder="/prɪˈnʌnsɪˈeɪʃ(ə)n/"
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E8303A]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Loại từ</label>
              <select value={pos} onChange={e => setPos(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#E8303A]">
                <option value="">— Chọn —</option>
                {PARTS_OF_SPEECH.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Meaning */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nghĩa</h2>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Định nghĩa (Tiếng Anh)</label>
            <textarea value={def} onChange={e => setDef(e.target.value)} rows={2} placeholder="English definition..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Nghĩa tiếng Việt</label>
            <textarea value={defVi} onChange={e => setDefVi(e.target.value)} rows={2} placeholder="Nghĩa tiếng Việt..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Ví dụ (EN)</label>
            <textarea value={example} onChange={e => setExample(e.target.value)} rows={2} placeholder="Example sentence in English..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Dịch ví dụ (VN)</label>
            <textarea value={exampleVi} onChange={e => setExampleVi(e.target.value)} rows={2} placeholder="Dịch nghĩa câu ví dụ..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
          </div>
        </div>

        {/* Related words */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Từ liên quan</h2>
          <TagInput label="Từ đồng nghĩa (Synonyms)" values={synonyms} onChange={setSynonyms} />
          <TagInput label="Từ trái nghĩa (Antonyms)" values={antonyms} onChange={setAntonyms} />
          <TagInput label="Họ hàng từ (Word family)" values={related} onChange={setRelated} />
        </div>

        {/* Image + meta */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hình ảnh & ghi chú</h2>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">URL hình ảnh</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
              className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#E8303A]" />
            {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-28 w-auto rounded-xl object-cover" onError={e => (e.currentTarget.style.display='none')} />}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Ghi chú cá nhân</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Mẹo ghi nhớ, ngữ cảnh dùng..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#E8303A]" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-semibold text-gray-500">Độ khó</label>
              <div className="flex gap-2">
                {['easy','medium','hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${difficulty === d
                      ? d === 'easy' ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : d === 'medium' ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                        : 'border-red-400 bg-red-50 text-red-600'
                      : 'border-gray-200 text-gray-400'}`}>
                    {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs font-semibold text-gray-500">Tags</label>
              <div className="flex gap-1.5">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="tag rồi Enter"
                  className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#E8303A]" />
                <button onClick={addTag} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Plus size={14} /></button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map(t => <span key={t} className="flex items-center gap-1 text-[0.65rem] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}<button onClick={() => setTags(tags.filter(x => x !== t))}><X size={9} /></button></span>)}
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!word.trim() || pending}
          className="w-full h-12 font-bold text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: collection.color }}>
          {pending ? 'Đang lưu...' : initialWord ? 'Cập nhật từ' : 'Lưu từ vựng'} →
        </button>
      </div>
    </div>
  )
}
