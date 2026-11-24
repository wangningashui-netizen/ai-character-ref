import type { ReactNode } from 'react'

export function PageHeader({ kicker = '如水 · 角色参考', title, description, actions }: { kicker?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.28em] text-cinnabar">{kicker}</p>
        <h1 className="mt-2 font-serif text-[2.1rem] leading-none tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
