interface ScoreCardProps {
  label: string
  correct: number
  total: number
}

export function ScoreCard({ label, correct, total }: ScoreCardProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(26,39,68,0.08)]">
      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-4xl font-bold text-[#1A2744] my-1">{correct}</div>
      <div className="text-xs text-gray-400">/ {total} câu ({pct}%)</div>
    </div>
  )
}
