import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FilterRail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] tracking-[0.22em] text-muted-foreground">{label}</p>
      <div className="mast-nav -mx-4 flex gap-1 overflow-x-auto px-4">{children}</div>
    </div>
  )
}

export function FilterTab({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-11 shrink-0 border-b px-3 text-[15px]',
        active ? 'border-cinnabar text-foreground' : 'border-transparent text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}
