import { Badge } from '@/components/ui/badge'
import { AudioPlayer } from './AudioPlayer'

interface ListeningPanelProps {
  title: string | null
  audioSrc: string | null
  passageId: string
}

export function ListeningPanel({ title, audioSrc, passageId }: ListeningPanelProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-[0_4px_24px_rgba(26,39,68,0.10)]">
      <div className="pb-4 mb-5 border-b-2 border-gray-100 flex items-center gap-3 flex-wrap">
        <Badge className="bg-[#1A2744] text-white text-[0.75rem] font-bold tracking-widest uppercase rounded-full px-3.5 py-1 hover:bg-[#1A2744]">
          NGHE HIỂU
        </Badge>
        {title && (
          <span className="text-base font-bold text-[#1A2744] leading-snug">{title}</span>
        )}
      </div>

      {audioSrc ? (
        <AudioPlayer src={audioSrc} audioId={`pg_${passageId}`} />
      ) : (
        <p className="text-gray-400 text-sm">Audio sẽ được cập nhật sớm.</p>
      )}

      <div className="mt-4 px-4 py-3.5 bg-blue-50 rounded-xl text-sm text-blue-700 leading-relaxed">
        Nghe audio, sau đó trả lời tất cả các câu hỏi ở bên phải.
        <br />
        Bạn có thể nghe lại bằng nút replay.
      </div>
    </div>
  )
}
