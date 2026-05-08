'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  src: string
  audioId: string
  onPlay?: () => void
  className?: string
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, audioId, onPlay, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = useCallback(async () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      setLoading(true)
      onPlay?.()
      try {
        await el.play()
      } catch {
        setLoading(false)
      }
    } else {
      el.pause()
    }
  }, [onPlay])

  const restart = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    if (!el.paused) el.play()
  }, [])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    if (!el || !el.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    el.currentTime = pct * el.duration
  }, [])

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (error) {
    return (
      <div className={cn('flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm', className)}>
        <AlertTriangle size={18} />
        <span>Không thể tải audio. Vui lòng liên hệ HappyHouse.</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border-2 p-5 transition-all',
        playing
          ? 'bg-gradient-to-r from-red-50 to-red-100/50 border-[#E8303A]'
          : 'bg-gradient-to-r from-[#F0F4FF] to-[#E8F0FF] border-[#D1E3FF] hover:border-[#1A2744] hover:shadow-md',
        className
      )}
    >
      {/* Controls */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={toggle}
          disabled={loading}
          title="Play/Pause"
          className={cn(
            'w-11 h-11 rounded-full bg-[#1A2744] text-white flex items-center justify-center transition-all hover:bg-[#E8303A] hover:scale-105 active:scale-95',
            loading && 'opacity-60 cursor-wait'
          )}
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : playing ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>
        <button
          onClick={restart}
          title="Replay"
          className="w-9 h-9 rounded-full bg-[#1A2744]/10 text-[#1A2744] flex items-center justify-center transition-all hover:bg-[#1A2744]/20"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Track */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A2744] uppercase tracking-wide">
          {playing && (
            <span className="flex gap-0.5 items-end">
              {[0, 100, 200].map(delay => (
                <span
                  key={delay}
                  className="w-0.5 h-2 bg-[#1A2744] inline-block animate-[wave_1s_ease-in-out_infinite]"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          )}
          Listening Audio
        </div>
        <div
          className="h-1.5 bg-[#1A2744]/10 rounded-full relative cursor-pointer overflow-hidden group"
          onClick={seek}
        >
          <div
            className="absolute inset-y-0 left-0 bg-[#1A2744] group-hover:bg-[#E8303A] rounded-full transition-colors"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400 font-semibold min-w-[80px] justify-end tabular-nums shrink-0">
        <span>{formatTime(currentTime)}</span>
        <span className="opacity-50">/</span>
        <span>{formatTime(duration)}</span>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onPlay={() => { setPlaying(true); setLoading(false) }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); if (audioRef.current) audioRef.current.currentTime = 0 }}
        onError={() => setError(true)}
      >
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  )
}
