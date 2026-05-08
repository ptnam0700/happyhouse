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
        'sticky top-0 z-50 h-16 bg-[#1A2744] px-8 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2.5 text-white font-bold text-xl">
        <div className="w-10 h-10 flex items-center justify-center">
          <Image
            src="/happy_house_sun.png"
            alt="HappyHouse Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <span>HappyHouse IELTS</span>
      </div>

      {showTimer && (
        <div
          className={cn(
            'flex items-center gap-1.5 font-semibold text-lg',
            isWarning ? 'text-[#E8303A]' : 'text-[#F5A623]'
          )}
        >
          <Clock size={18} />
          <span>{formatTime(timeLeft!)}</span>
        </div>
      )}
    </header>
  )
}
