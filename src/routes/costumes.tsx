import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckIcon, CopyIcon, DownloadIcon, ExternalLinkIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { costumesQuery, isNsfwCostume, isNsfwCostumeCategory } from '@/api/gallery'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterRail, FilterTab } from '@/components/editorial/FilterRail'
import { Spread } from '@/components/editorial/Spread'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CHARADB_NOTICE_URL } from '@/lib/charadb'
import { COSTUME_SOURCES, SHISEI_SOURCE_URLS, costumeSourceId, selectCostumeView } from '@/lib/costumeSources'
import { toast } from '@/lib/notifications'
import { downloadRemoteImage, referenceImageUrl } from '@/lib/recipeImages'
import { useStudio } from '@/store/studioStore'

export const Route = createFileRoute('/costumes')({
  staticData: { title: '服装' },
  loader: ({ context }) => context.queryClient.ensureQueryData(costumesQuery),
  component: CostumesPage,
})

function CostumesPage() {
  const { data: costumes } = useSuspenseQuery(costumesQuery)
  const { recipe, toggleCostume, safeMode, requestUnlockNsfw } = useStudio()
  const [source, setSource] = useState('all')
  const [view, setView] = useState({ itemId: '', id: 'front' })
  const [category, setCategory] = useState('')
  const [kind, setKind] = useState('全部')
  const [tag, setTag] = useState('all')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(24)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [failed, setFailed] = useState<Record<string, boolean>>({})

  const activeCategory = safeMode && category && isNsfwCostumeCategory(category) ? '' : category
  const baseCostumes = useMemo(
    () => costumes.filter((x) => (source === 'all' || costumeSourceId(x) === source) && (kind === '全部' || (x.一级分类 || '现实') === kind) && (!safeMode || !isNsfwCostume(x))),
    [costumes, safeMode, kind, source],
  )
  const hiddenNsfwCount = costumes.filter((x) => (source === 'all' || costumeSourceId(x) === source) && (kind === '全部' || (x.一级分类 || '现实') === kind) && isNsfwCostume(x)).length
  const categories = useMemo(() => [...new Set(baseCostumes.map((x) => x.分类))], [baseCostumes])
  const activeTag = tag === 'all' || baseCostumes.some((x) => (!activeCategory || x.分类 === activeCategory) && x.标签.includes(tag)) ? tag : 'all'
  const allTags = useMemo(() => {
    const subset = baseCostumes.filter((x) => !activeCategory || x.分类 === activeCategory)
    return [...new Set(subset.flatMap((x) => x.标签 || []))]
  }, [baseCostumes, activeCategory])
  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => baseCostumes.filter((item) => {
    if (activeCategory && item.分类 !== activeCategory) return false
    if (activeTag !== 'all' && !(item.标签 || []).includes(activeTag)) return false
    if (q && !item.检索.toLowerCase().includes(q)) return false
    return true
  }), [baseCostumes, activeCategory, activeTag, q])

  const viewedItem = viewerIndex !== null ? filtered[viewerIndex] : null
  const currentItem = viewedItem ? selectCostumeView(viewedItem, view.itemId === viewedItem.id ? view.id : viewedItem.selectedView || 'front') : null

  useEffect(() => {
    if (viewerIndex === null || !filtered.length) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setViewerIndex((viewerIndex + 1) % filtered.length)
      else if (e.key === 'ArrowLeft') setViewerIndex((viewerIndex - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewerIndex, filtered.length])

  const external = currentItem ? ['charadb', 'gia-anime'].includes(currentItem.source || '') : false

  return (
    <>
      <PageHeader kicker="栏目 02" title="服装" description="写实、历代、动漫和二次元放在同一本目录里。来源不同，使用时请看每套旁边的说明。" />

      <FilterRail label="大类">
        {['全部', '现实', '二次元'].map((value) => (
          <FilterTab key={value} active={kind === value} onClick={() => { setKind(value); setCategory(''); setTag('all'); setShown(24); setViewerIndex(null) }}>{value}</FilterTab>
        ))}
      </FilterRail>
      <FilterRail label="来源">
        <FilterTab active={source === 'all'} onClick={() => { setSource('all'); setCategory(''); setTag('all'); setShown(24) }}>全部来源</FilterTab>
        {COSTUME_SOURCES.map((entry) => (
          <FilterTab key={entry.id} active={source === entry.id} onClick={() => { setSource(entry.id); setCategory(''); setTag('all'); setShown(24) }}>{entry.label}</FilterTab>
        ))}
      </FilterRail>
      <details className="text-xs leading-relaxed text-muted-foreground">
        <summary className="min-h-11 cursor-pointer text-sm text-foreground">看来源说明</summary>
        <div className="space-y-1 pb-2">
          {COSTUME_SOURCES.filter((entry) => (source === 'all' || source === entry.id) && (kind === '全部' || (['gia-anime', 'charadb'].includes(entry.id) ? '二次元' : '现实') === kind)).map((entry) => (
            <p key={entry.id}><a className="text-cinnabar" href={entry.url} target="_blank" rel="noopener noreferrer">{entry.label}</a>　{entry.notice}</p>
          ))}
        </div>
      </details>

      <FilterRail label="穿搭">
        <FilterTab active={activeCategory === ''} onClick={() => { setCategory(''); setTag('all'); setShown(24) }}>全部 {baseCostumes.length}</FilterTab>
        {categories.map((c) => (
          <FilterTab key={c} active={activeCategory === c} onClick={() => { setCategory(c); setTag('all'); setShown(24) }}>
            {c}{isNsfwCostumeCategory(c) ? ' · 18+' : ''}
          </FilterTab>
        ))}
        {safeMode && hiddenNsfwCount > 0 && (
          <FilterTab active={false} onClick={() => requestUnlockNsfw(() => { setCategory(''); setTag('all'); setShown(24) })}>解锁 18+（{hiddenNsfwCount}）</FilterTab>
        )}
      </FilterRail>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setShown(24) }} placeholder="搜索款式、颜色、面料，或英文词" className="h-12 border-rule bg-white pl-9" />
        </div>
        <select value={activeTag} aria-label="标签" onChange={(e) => { setTag(e.target.value); setShown(24) }} className="h-12 border border-rule bg-white px-3 text-sm">
          <option value="all">全部标签</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="button" className="h-12 border border-rule px-4 text-sm" onClick={() => { setCategory(''); setTag('all'); setQuery(''); setKind('全部'); setSource('all'); setShown(24) }}>重置</button>
      </div>

      {filtered.length === 0 ? <EmptyState title="没有找到这套衣服" description="换个词，或换一个来源" /> : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {filtered.slice(0, shown).map((item, idx) => {
            const picked = recipe.costume?.id === item.id
            return (
              <article key={item.id}>
                <button type="button" onClick={() => setViewerIndex(idx)} className="relative block w-full border border-rule bg-paper">
                  {!failed[item.id] && (
                    <img src={referenceImageUrl(item.缩略图)} alt={item.服装名称} loading="lazy" onError={() => setFailed((prev) => ({ ...prev, [item.id]: true }))} className="aspect-[2/3] w-full object-contain" />
                  )}
                  {failed[item.id] && <span className="flex aspect-[2/3] items-center justify-center px-3 text-xs text-muted-foreground">图片暂时打不开</span>}
                </button>
                <h2 className="mt-3 line-clamp-2 font-serif text-lg leading-snug">{item.服装名称}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{item.来源 || 'ギア · 写实'} · {item.分类}</p>
                <button type="button" onClick={() => toggleCostume(item)} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm">
                  {picked ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                  {picked ? '已在配方' : '加入配方'}
                </button>
              </article>
            )
          })}
        </div>
      )}

      {shown < filtered.length && (
        <button type="button" className="mx-auto min-h-12 border border-rule px-6 text-sm" onClick={() => setShown((s) => s + 24)}>再看 {Math.min(24, filtered.length - shown)} 套</button>
      )}

      <Spread
        open={viewerIndex !== null}
        onOpenChange={(open) => !open && setViewerIndex(null)}
        imageUrl={currentItem ? referenceImageUrl(currentItem.预览图 || currentItem.原图) : ''}
        alt={currentItem?.服装名称 || ''}
        title={currentItem?.服装名称 || ''}
        onPrev={viewerIndex !== null ? () => setViewerIndex((viewerIndex - 1 + filtered.length) % filtered.length) : undefined}
        onNext={viewerIndex !== null ? () => setViewerIndex((viewerIndex + 1) % filtered.length) : undefined}
      >
        {currentItem && (
          <>
            <p className="text-sm text-muted-foreground">{currentItem.来源 || 'ギア（@giaaibusi）'} · {currentItem.分类}</p>
            {currentItem.views && currentItem.views.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {currentItem.views.map((entry) => (
                  <button key={entry.id} type="button" className={`min-h-11 border px-3 text-sm ${currentItem.selectedView === entry.id ? 'border-foreground bg-foreground text-white' : 'border-rule'}`} onClick={() => setView({ itemId: currentItem.id, id: entry.id })}>{entry.label}</button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {(currentItem.标签 || []).map((t) => <span key={t} className="border border-rule px-2 py-1 text-xs">{t}</span>)}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>英文提示词</span>
                <button type="button" className="inline-flex min-h-11 items-center gap-1 text-cinnabar" onClick={() => { void navigator.clipboard.writeText(currentItem.关键词); toast.success('已复制') }}><CopyIcon className="size-3.5" />复制</button>
              </div>
              <p className="border border-rule p-3 font-mono text-xs leading-relaxed">{currentItem.关键词}</p>
            </div>
            {currentItem.source === 'shisei' && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Shisei / wquguru，CC0，是 AI 服装参考，不是专业复原。
                <a className="ml-2 text-cinnabar" href={SHISEI_SOURCE_URLS.license} target="_blank" rel="noopener noreferrer">许可</a>
                <a className="ml-2 text-cinnabar" href={SHISEI_SOURCE_URLS.repository} target="_blank" rel="noopener noreferrer">原仓库</a>
              </p>
            )}
            {currentItem.source === 'charadb' && <a className="text-xs text-cinnabar" href={CHARADB_NOTICE_URL} target="_blank" rel="noopener noreferrer">图片只供参考，禁止真人、未成年人及再分发</a>}
            <div className="mt-auto flex flex-col gap-2">
              <Button className="min-h-12" onClick={() => toggleCostume(currentItem)}>
                {recipe.costume?.id === currentItem.id && (recipe.costume.selectedView || 'front') === (currentItem.selectedView || 'front') ? '从配方移除' : '加入配方'}
              </Button>
              {external ? (
                <Button variant="outline" className="min-h-12" asChild>
                  <a href={currentItem.来源地址 || referenceImageUrl(currentItem.原图)} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon className="size-4" />打开原站图片</a>
                </Button>
              ) : (
                <Button variant="outline" className="min-h-12" onClick={() => void downloadRemoteImage(referenceImageUrl(currentItem.原图), `${currentItem.id}.webp`).catch(() => toast.error('下载失败，请稍后再试'))}>
                  <DownloadIcon className="size-4" />下载原图
                </Button>
              )}
            </div>
          </>
        )}
      </Spread>
    </>
  )
}
