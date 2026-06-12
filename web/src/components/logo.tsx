import { Link } from '@tanstack/react-router'
import { Highlighter } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-highlight">
        <Highlighter className="h-5 w-5" />
      </span>
      <span className="relative text-lg font-bold tracking-tight">
        <span className="relative z-10 px-1">Grifo</span>
        <span
          className="absolute inset-x-0 bottom-0.5 h-2.5 bg-highlight"
          aria-hidden
        />
      </span>
    </Link>
  )
}
