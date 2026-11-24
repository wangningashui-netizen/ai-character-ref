import { Link, useRouterState } from '@tanstack/react-router'
import { ShieldCheckIcon } from 'lucide-react'
import { useStudio } from '@/store/studioStore'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/', label: '本期' },
  { to: '/poses', label: '姿势' },
  { to: '/costumes', label: '服装' },
  { to: '/portraits', label: '人像' },
  { to: '/studio', label: '合成台' },
  { to: '/settings', label: '密钥' },
  { to: '/guide', label: '致谢' },
] as const

export function Masthead() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { safeMode, toggleSafeMode, recipe } = useStudio()
  const picked = [recipe.portrait, recipe.costume, recipe.pose].filter(Boolean).length

  return (
    <header className="border-b border-rule bg-white">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 pt-5 pb-4 sm:px-6">
        <Link to="/" className="min-w-0">
          <p className="text-[11px] tracking-[0.32em] text-cinnabar">RUSHUI</p>
          <h1 className="font-serif text-[1.7rem] leading-none tracking-tight text-foreground sm:text-4xl">
            如水<span className="text-cinnabar">·</span>角色参考
          </h1>
        </Link>
        <button
          type="button"
          onClick={toggleSafeMode}
          className="mb-0.5 flex min-h-11 shrink-0 items-center gap-2 border border-rule px-3 text-left text-xs"
          aria-pressed={safeMode}
        >
          <ShieldCheckIcon className="size-4" />
          <span>
            <span className="block tracking-[0.16em] text-muted-foreground">安全模式</span>
            <span className="font-medium">{safeMode ? '开 · 已隐藏 18+' : '关 · 含 18+'}</span>
          </span>
        </button>
      </div>
      <nav className="mast-nav mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4" aria-label="栏目">
        {LINKS.map((item) => {
          const active = item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'relative min-h-12 shrink-0 px-3 py-3 text-[15px] tracking-wide',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
              {item.to === '/studio' && picked > 0 && (
                <span className="ml-1 font-serif text-cinnabar">{picked}</span>
              )}
              {active && <span className="absolute inset-x-3 bottom-0 h-px bg-cinnabar" />}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
