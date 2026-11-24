import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckIcon, CopyIcon, DownloadIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { portraitsQuery } from '@/api/gallery'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterRail, FilterTab } from '@/components/editorial/FilterRail'
import { Spread } from '@/components/editorial/Spread'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/notifications'
import { downloadRemoteImage, referenceImageUrl } from '@/lib/recipeImages'
import { useStudio } from '@/store/studioStore'

export const Route = createFileRoute('/portraits')({
  staticData: { title: '人像' },
  loader: ({ context }) => context.queryClient.ensureQueryData(portraitsQuery),
  component: PortraitsPage,
})

const HAIRS = ['短发', '中发', '中长发', '长发'] as const

function PortraitsPage() {
  const { data: portraits } = useSuspenseQuery(portraitsQuery)
  const { recipe, togglePortrait } = useStudio()
  const [section, setSection] = useState<'' | '正脸参考' | '造型氛围'>('')
  const [hair, setHair] = useState('')
  const [styleName, setStyleName] = useState('all')
  const [onlyHot, setOnlyHot] = useState(false)
  const [onlyPick, setOnlyPick] = useState(false)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(24)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const styleOptions = useMemo(() => {
    const sub = portraits.filter((p) => (!section || p.分区 === section) && (!hair || p.发长 === hair))
    return [...new Set(sub.map((p) => p.发型名称).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }, [portraits, section, hair])
  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => portraits.filter((item) => {
    if (section && item.分区 !== section) return false
    if (hair && item.发长 !== hair) return false
    if (styleName !== 'all' && item.发型名称 !== styleName) return false
    if (onlyHot && !item.热门) return false
    if (onlyPick && !item.精选) return false
    if (q && !item.检索.toLowerCase().includes(q)) return false
    return true
  }), [portraits, section, hair, styleName, onlyHot, onlyPick, q])
  const currentItem = viewerIndex !== null ? filtered[viewerIndex] : null

  useEffect(() => {
    if (viewerIndex === null || !filtered.length) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setViewerIndex((viewerIndex + 1) % filtered.length)
      else if (e.key === 'ArrowLeft') setViewerIndex((viewerIndex - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewerIndex, filtered.length])

  const imageUrl = currentItem ? referenceImageUrl(currentItem.原图) : ''

  return (
    <>
      <PageHeader
        kicker="栏目 03"
        title="人像"
        description="正脸用来定五官，造型用来定气氛。热门和精选可以先看一遍。"
        actions={
          <div className="flex border border-rule">
            <button type="button" className={`min-h-11 px-3 text-sm ${onlyPick ? 'bg-foreground text-white' : ''}`} onClick={() => { setOnlyPick((v) => !v); setShown(24) }}>精选</button>
            <button type="button" className={`min-h-11 px-3 text-sm ${onlyHot ? 'bg-foreground text-white' : ''}`} onClick={() => { setOnlyHot((v) => !v); setShown(24) }}>热门</button>
          </div>
        }
      />

      <FilterRail label="分区与发长">
        <FilterTab active={section === '' && hair === ''} onClick={() => { setSection(''); setHair(''); setStyleName('all'); setShown(24) }}>全部 {portraits.length}</FilterTab>
        {(['正脸参考', '造型氛围'] as const).map((sec) => (
          <FilterTab key={sec} active={section === sec} onClick={() => { setSection(section === sec ? '' : sec); setStyleName('all'); setShown(24) }}>{sec}</FilterTab>
        ))}
        {HAIRS.map((h) => (
          <FilterTab key={h} active={hair === h} onClick={() => { setHair(hair === h ? '' : h); setStyleName('all'); setShown(24) }}>{h}</FilterTab>
        ))}
      </FilterRail>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setShown(24) }} placeholder="搜索发型，比如波波头、狼尾、空气刘海" className="h-12 border-rule bg-white pl-9" />
        </div>
        <select aria-label="发型" value={styleName} onChange={(e) => { setStyleName(e.target.value); setShown(24) }} className="h-12 border border-rule bg-white px-3 text-sm">
          <option value="all">全部发型</option>
          {styleOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="button" className="h-12 border border-rule px-4 text-sm" onClick={() => { setSection(''); setHair(''); setStyleName('all'); setOnlyHot(false); setOnlyPick(false); setQuery(''); setShown(24) }}>重置</button>
      </div>

      {filtered.length === 0 ? <EmptyState title="没有找到这张脸" description="换个发型词，或取消热门和精选" /> : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {filtered.slice(0, shown).map((item) => {
            const picked = recipe.portrait?.id === item.id
            return (
              <article key={item.id}>
                <button type="button" onClick={() => setViewerIndex(filtered.indexOf(item))} className="block w-full border border-rule bg-paper">
                  <img src={referenceImageUrl(item.缩略图)} alt={item.标题} loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
                </button>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <h2 className="min-w-0 flex-1 font-serif text-lg leading-snug">{item.发型名称}</h2>
                  {item.热门 && <span className="shrink-0 text-[11px] tracking-[0.16em] text-cinnabar">热门</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.分区} · {item.发长}</p>
                <button type="button" onClick={() => togglePortrait(item)} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm">
                  {picked ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                  {picked ? '已在配方' : '加入配方'}
                </button>
              </article>
            )
          })}
        </div>
      )}

      {shown < filtered.length && (
        <button type="button" className="mx-auto min-h-12 border border-rule px-6 text-sm" onClick={() => setShown((s) => s + 24)}>再看 {Math.min(24, filtered.length - shown)} 张</button>
      )}

      <Spread
        open={viewerIndex !== null}
        onOpenChange={(open) => !open && setViewerIndex(null)}
        imageUrl={imageUrl}
        alt={currentItem?.标题 || ''}
        title={currentItem?.标题 || ''}
        onPrev={viewerIndex !== null ? () => setViewerIndex((viewerIndex - 1 + filtered.length) % filtered.length) : undefined}
        onNext={viewerIndex !== null ? () => setViewerIndex((viewerIndex + 1) % filtered.length) : undefined}
      >
        {currentItem && (
          <>
            <p className="text-sm text-muted-foreground">{currentItem.分区} · {currentItem.发长} · {currentItem.发型名称}</p>
            <div className="flex items-center justify-between border-y border-rule py-2 font-mono text-xs">
              <span>{currentItem.id}</span>
              <button type="button" aria-label="复制编号" onClick={() => { void navigator.clipboard.writeText(currentItem.id); toast.success('已复制编号') }}><CopyIcon className="size-4" /></button>
            </div>
            <dl className="grid grid-cols-[5rem_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">尺寸</dt><dd>{currentItem.宽} × {currentItem.高}</dd>
              <dt className="text-muted-foreground">授权</dt><dd>CC0，可自由使用</dd>
              <dt className="text-muted-foreground">标记</dt><dd>{[currentItem.精选 && '精选', currentItem.热门 && '热门'].filter(Boolean).join(' · ') || '—'}</dd>
            </dl>
            <div className="mt-auto flex flex-col gap-2">
              <Button className="min-h-12" onClick={() => togglePortrait(currentItem)}>{recipe.portrait?.id === currentItem.id ? '从配方移除' : '加入配方'}</Button>
              <Button variant="outline" className="min-h-12" onClick={() => void downloadRemoteImage(imageUrl, `${currentItem.id}.png`).catch(() => toast.error('下载失败，请稍后再试'))}>
                <DownloadIcon className="size-4" />下载原图
              </Button>
            </div>
          </>
        )}
      </Spread>
    </>
  )
}
