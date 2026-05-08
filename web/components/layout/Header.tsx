'use client'

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  timeLeft?: number | null
  className?: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function Header({ timeLeft, className }: HeaderProps) {
  const showTimer = timeLeft != null && timeLeft > 0
  const isWarning = timeLeft != null && timeLeft <= 300

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full h-16 bg-[#1A2744] flex items-center justify-between px-4 sm:px-8',
        className
      )}
    >
      <div className="flex items-center gap-2 text-white font-bold text-base sm:text-xl min-w-0">
        <div className="w-9 h-9 shrink-0 flex items-center justify-center">
          <Image
            src="/happy_house_sun.png"
            alt="HappyHouse Logo"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        <span className="truncate">HappyHouse IELTS</span>
      </div>

      {showTimer && (
        <div
          className={cn(
            'flex items-center gap-1.5 font-semibold text-base sm:text-lg shrink-0 ml-2',
            isWarning ? 'text-[#E8303A]' : 'text-[#F5A623]'
          )}
        >
          <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="tabular-nums">{formatTime(timeLeft!)}</span>
        </div>
      )}
    </header>
  )
}
