'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react'
import { bulkImportWords } from '../../actions'

interface Props { collection: { id: string; name: string; color: string } }

interface PreviewRow { word: string; definition?: string; definition_vi?: string; example_sentence?: string; synonyms?: string[]; tags?: string[]; valid: boolean }

const TEMPLATE_CSV = `word,definition,definition_vi,example_sentence,synonyms,tags
persevere,continue despite difficulty,kiên trì,"She persevered through hardship.","persist,endure","IELTS,Academic"
ambitious,having a strong desire to succeed,tham vọng,"He is an ambitious young man.","driven,determined","IELTS"`

export function ImportClient({ collection }: Props) {
  const router = useRouter()
  const [preview, setPreview]   = useState<PreviewRow[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError]       = useState('')
  const [, startTransition]     = useTransition()

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []; let cur = ''; let inQ = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ }
      else if (line[i] === ',' && !inQ) { result.push(cur.trim()); cur = '' }
      else cur += line[i]
    }
    result.push(cur.trim()); return result
  }

  const handleFile = async (file: File) => {
    setError(''); setFileName(file.name)
    let text = ''
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      try {
        const { read, utils } = await import('xlsx')
        const buf = await file.arrayBuffer()
        const wb = read(buf)
        const ws = wb.Sheets[wb.SheetNames[0]]
        text = utils.sheet_to_csv(ws)
      } catch { setError('Không đọc được file Excel. Hãy thử lưu dạng CSV.'); return }
    } else {
      text = await file.text()
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) { setError('File trống hoặc thiếu dữ liệu.'); return }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s/g,''))
    const colIdx = (name: string) => headers.findIndex(h => h.includes(name))
    const wIdx  = colIdx('word'), dIdx = colIdx('definition')
    if (wIdx === -1) { setError('Không tìm thấy cột "word". Hãy kiểm tra tiêu đề file.'); return }

    const rows: PreviewRow[] = lines.slice(1).map(line => {
      const cols = parseCSVLine(line)
      const word = cols[wIdx]?.replace(/^"|"$/g,'').trim() ?? ''
      const def  = dIdx >= 0 ? cols[dIdx]?.replace(/^"|"$/g,'').trim() : ''
      const defViIdx = colIdx('vi') >= 0 ? colIdx('vi') : colIdx('nghia')
      const defVi = defViIdx >= 0 ? cols[defViIdx]?.replace(/^"|"$/g,'').trim() : ''
      const exIdx = colIdx('example') >= 0 ? colIdx('example') : colIdx('ex')
      const example = exIdx >= 0 ? cols[exIdx]?.replace(/^"|"$/g,'').trim() : ''
      const synIdx = colIdx('synonym')
      const synonyms = synIdx >= 0 ? (cols[synIdx] ?? '').replace(/^"|"$/g,'').split(',').map(s => s.trim()).filter(Boolean) : []
      const tagIdx = colIdx('tag')
      const tags = tagIdx >= 0 ? (cols[tagIdx] ?? '').replace(/^"|"$/g,'').split(',').map(s => s.trim()).filter(Boolean) : []
      return { word, definition: def, definition_vi: defVi, example_sentence: example, synonyms, tags, valid: !!word }
    }).filter(r => r.word)

    setPreview(rows)
  }

  const handleImport = () => {
    const valid = preview.filter(r => r.valid)
    if (!valid.length) return
    startTransition(async () => {
      await bulkImportWords(collection.id, valid)
      router.push(`/portal/vocab/${collection.id}`)
    })
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'vocab-template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header style={{ background: collection.color }} className="px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link href={`/portal/vocab/${collection.id}`} className="text-white/80 hover:text-white text-sm font-medium">← {collection.name}</Link>
        <span className="text-white font-bold">Import từ vựng</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)] space-y-3">
          <h2 className="text-sm font-bold text-[#1A2744]">Hướng dẫn</h2>
          <div className="text-sm text-gray-500 space-y-1.5">
            <p>• File Excel (.xlsx) hoặc CSV (.csv) với các cột: <code className="bg-gray-100 px-1 rounded text-xs">word</code>, <code className="bg-gray-100 px-1 rounded text-xs">definition</code>, <code className="bg-gray-100 px-1 rounded text-xs">definition_vi</code>, <code className="bg-gray-100 px-1 rounded text-xs">example_sentence</code>, <code className="bg-gray-100 px-1 rounded text-xs">synonyms</code>, <code className="bg-gray-100 px-1 rounded text-xs">tags</code></p>
            <p>• Cột <strong>word</strong> là bắt buộc. Các cột còn lại tuỳ chọn.</p>
            <p>• Synonyms và tags viết cách nhau bằng dấu phẩy.</p>
          </div>
          <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <FileText size={15} /> Tải file mẫu (.csv)
          </button>
        </div>

        {/* Upload */}
        <label className="block cursor-pointer">
          <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${preview.length ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
            <Upload size={28} className="mx-auto mb-2 text-gray-400" />
            <p className="font-semibold text-[#1A2744] text-sm">{fileName || 'Nhấn để chọn file Excel hoặc CSV'}</p>
            <p className="text-xs text-gray-400 mt-1">.xlsx · .xls · .csv</p>
          </div>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(26,39,68,0.08)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-[#1A2744]">Xem trước — {preview.length} từ</span>
              <span className="text-xs text-gray-400">{preview.filter(r => r.valid).length} hợp lệ</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {preview.slice(0, 50).map((row, i) => (
                <div key={i} className={`flex items-start gap-3 px-5 py-3 ${!row.valid ? 'bg-red-50/50' : ''}`}>
                  {row.valid ? <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> : <X size={14} className="text-red-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-[#1A2744] text-sm">{row.word || '(trống)'}</span>
                    {row.definition_vi && <span className="text-xs text-gray-400 ml-2">{row.definition_vi}</span>}
                    {row.definition && !row.definition_vi && <span className="text-xs text-gray-400 ml-2">{row.definition}</span>}
                  </div>
                  {row.synonyms && row.synonyms.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {row.synonyms.slice(0,2).map(s => <span key={s} className="text-[0.6rem] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  )}
                </div>
              ))}
              {preview.length > 50 && <p className="px-5 py-3 text-xs text-gray-400 text-center">... và {preview.length - 50} từ nữa</p>}
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button onClick={handleImport} className="w-full h-11 font-bold text-white rounded-xl transition-colors" style={{ background: collection.color }}>
                Import {preview.filter(r => r.valid).length} từ vào bộ "{collection.name}" →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
