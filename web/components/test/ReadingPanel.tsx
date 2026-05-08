import { Badge } from '@/components/ui/badge'

interface ReadingPanelProps {
  title: string | null
  content: string | null
}

export function ReadingPanel({ title, content }: ReadingPanelProps) {
  const paragraphs = (content ?? '').split('\n').filter(p => p.trim())

  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(26,39,68,0.10)]">
      <div className="pb-4 mb-5 border-b-2 border-gray-100 flex items-center gap-3 flex-wrap">
        <Badge className="bg-[#1A2744] text-white text-[0.75rem] font-bold tracking-widest uppercase rounded-full px-3.5 py-1 hover:bg-[#1A2744]">
          ĐỌC HIỂU
        </Badge>
        {title && (
          <span className="text-base font-bold text-[#1A2744] leading-snug">{title}</span>
        )}
      </div>
      <div className="text-[0.9rem] leading-[1.85] text-[#2D3748]">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-4 last:mb-0">{p}</p>
        ))}
      </div>
    </div>
  )
}
