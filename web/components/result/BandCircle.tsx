interface BandCircleProps {
  band: string
}

export function BandCircle({ band }: BandCircleProps) {
  return (
    <div className="w-[200px] h-[200px] rounded-full bg-[#1A2744] mx-auto mb-6 flex flex-col items-center justify-center text-white">
      <div className="text-3xl font-extrabold leading-tight text-[#F5A623] text-center px-4">
        {band}
      </div>
      <div className="text-sm opacity-70 mt-1">Band IELTS</div>
    </div>
  )
}
