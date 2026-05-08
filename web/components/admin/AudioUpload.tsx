'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { uploadAudio } from '@/app/admin/passages/actions'

interface AudioUploadProps {
  onUploaded: (url: string) => void
}

export function AudioUpload({ onUploaded }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleFile = async (file: File) => {
    setFilename(file.name)
    setState('uploading')
    setErrorMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { url } = await uploadAudio(fd)
      onUploaded(url)
      setState('done')
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Lỗi tải lên')
      setState('error')
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === 'uploading'}
        className="flex items-center gap-2 h-9 px-4 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-[#1A2744] hover:text-[#1A2744] transition-colors disabled:opacity-50"
      >
        {state === 'uploading' ? <Loader2 size={15} className="animate-spin" /> :
         state === 'done'      ? <CheckCircle size={15} className="text-emerald-500" /> :
         state === 'error'     ? <AlertTriangle size={15} className="text-red-500" /> :
                                 <Upload size={15} />}
        {state === 'uploading' ? 'Đang tải lên...' :
         state === 'done'      ? `Đã tải: ${filename}` :
         state === 'error'     ? (errorMsg || 'Lỗi — thử lại') :
                                 'Tải audio lên (.mp3 .m4a .wav .ogg)'}
      </button>
    </div>
  )
}
