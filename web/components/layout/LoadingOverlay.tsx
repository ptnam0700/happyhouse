import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  show: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ show, message = 'Đang tải...', className }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[999] bg-[#1A2744]/60 flex flex-col items-center justify-center gap-4',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      <span className="text-white text-lg font-semibold">{message}</span>
    </div>
  )
}
