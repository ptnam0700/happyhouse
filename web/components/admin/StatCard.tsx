import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: boolean
}

export function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-2xl p-5 flex items-start justify-between',
      accent ? 'bg-[#E8303A] text-white' : 'bg-white shadow-[0_2px_8px_rgba(26,39,68,0.08)]'
    )}>
      <div>
        <p className={cn('text-xs font-semibold uppercase tracking-wide mb-1', accent ? 'text-white/70' : 'text-gray-400')}>
          {label}
        </p>
        <p className={cn('text-3xl font-bold', accent ? 'text-white' : 'text-[#1A2744]')}>
          {value}
        </p>
        {sub && (
          <p className={cn('text-xs mt-1', accent ? 'text-white/70' : 'text-gray-400')}>{sub}</p>
        )}
      </div>
      <div className={cn('p-2.5 rounded-xl', accent ? 'bg-white/20' : 'bg-[#F7F6F2]')}>
        <Icon size={20} className={accent ? 'text-white' : 'text-[#1A2744]'} />
      </div>
    </div>
  )
}
