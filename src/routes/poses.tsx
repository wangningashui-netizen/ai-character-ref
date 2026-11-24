import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckIcon, CopyIcon, DownloadIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ANGLES, isNsfwPose, isNsfwPoseSystem, posesQuery } from '@/api/gallery'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterRail, FilterTab } from '@/components/editorial/FilterRail'
import { Spread } from '@/components/editorial/Spread'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/notifications'
import { downloadRemoteImage, poseImagePath, poseThumbPath, referenceImageUrl } from '@/lib/recipeImages'
import { cn } from '@/lib/utils'
import { useStudio } from '@/store/studioStore'
import type { PoseGroup, PoseItem } from '@/types/gallery'

export const Route = createFileRoute('/poses')({
  staticData: { title: '姿势' },
  loader: ({ context }) => context.queryClient.ensureQueryData(posesQuery),
  component: PosesPage,
})

function PosesPage() {
  const { data } = useSuspenseQuery(posesQuery)
  const { recipe, togglePose, safeMode, requestUnlockNsfw, poseDepthMode, setPoseDepthMode } = useStudio()
  const [line, setLine] = useState('')
  const [category, setCategory] = useState('all')
  const [angle, setAngle] = useState('')
  const [viewMode, setViewMode] = useState<'group' | 'single'>('group')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(24)
  const [hoverAngles, setHoverAngles] = useState<Record<string, string>>({})
  const [viewer, setViewer] = useState<{ groupIndex: number; item: PoseItem } | null>(null)

  const activeLine = safeMode && line && isNsfwPoseSystem(line) ? '' : line
  const baseItems = useMemo(() => (safeMode ? data.items.filter((x) => !isNsfwPose(x)) : data.items), [data.items, safeMode])
  const baseGroups = useMemo(() => (safeMode ? data.groups.filter((g) => !isNsfwPose(g)) : data.groups), [data.groups, safeMode])
  const visibleLines = useMemo(() => (safeMode ? data.lines.filter((l) => !isNsfwPoseSystem(l)) : data.lines), [data.lines, safeMode])
  const hiddenNsfwCount = data.items.length - baseItems.length
  const categories = useMemo(() => {
    const filtered = baseItems.filter((x) => !activeLine || x.体系 === activeLine)
    return [...new Set(filtered.map((x) => x.分类).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }, [baseItems, activeLine])
  const q = query.trim().toLowerCase()
  const filteredGroups = useMemo(() => baseGroups.filter((g) => {
    if (activeLine && g.system !== activeLine) return false
    if (category !== 'all' && g.category !== category) return false
    return g.items.some((it) => {
      if (angle && it.角度 !== angle) return false
      if (q && !`${it.姿势名称} ${it.id} ${it.分类} ${it.姿势编号} ${it.体系}`.toLowerCase().includes(q)) return false
      return true
    })
  }), [baseGroups, activeLine, category, angle, q])
  const filteredSingles = useMemo(() => baseItems.filter((it) => {
    if (activeLine && it.体系 !== activeLine) return false
    if (category !== 'all' && it.分类 !== category) return false
    if (angle && it.角度 !== angle) return false
    if (q && !`${it.姿势名称} ${it.id} ${it.分类} ${it.姿势编号} ${it.体系}`.toLowerCase().includes(q)) return false
    return true
  }), [baseItems, activeLine, category, angle, q])

  useEffect(() => {
    if (!viewer) return
    const onKey = (e: KeyboardEvent) => {
      const grp = filteredGroups[viewer.groupIndex]
      if (!grp) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const dir = e.key === 'ArrowRight' ? 1 : -1
        const idx = grp.order.findIndex((x) => x.id === viewer.item.id)
        const nextItem = grp.order[(idx + dir + grp.order.length) % grp.order.length]
        if (nextItem) setViewer({ groupIndex: viewer.groupIndex, item: nextItem })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewer, filteredGroups])

  const getActiveGroupItem = (group: PoseGroup): PoseItem => {
    const overrideAngle = hoverAngles[group.key]
    if (overrideAngle && group.angles[overrideAngle]) return group.angles[overrideAngle]
    if (angle && group.angles[angle]) return group.angles[angle]
    return group.order[0]
  }

  const totalCount = viewMode === 'group' ? filteredGroups.length : filteredSingles.length
  const viewerGroup = viewer ? filteredGroups[viewer.groupIndex] : undefined
  const viewerImage = viewer ? referenceImageUrl(poseImagePath(viewer.item, poseDepthMode)) : ''

  return (
    <>
      <PageHeader
        kicker="栏目 01"
        title="姿势"
        description="白模看动作，深度图给需要轮廓的工作流。点小图换角度，点大图看原图。"
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="flex border border-rule">
              <button type="button" className={cn('min-h-11 px-3 text-sm', !poseDepthMode && 'bg-foreground text-white')} onClick={() => setPoseDepthMode(false)}>白模</button>
              <button type="button" className={cn('min-h-11 px-3 text-sm', poseDepthMode && 'bg-foreground text-white')} onClick={() => setPoseDepthMode(true)}>深度</button>
            </div>
            <div className="flex border border-rule">
              <button type="button" className={cn('min-h-11 px-3 text-sm', viewMode === 'group' && 'bg-foreground text-white')} onClick={() => { setViewMode('group'); setShown(24) }}>成组</button>
              <button type="button" className={cn('min-h-11 px-3 text-sm', viewMode === 'single' && 'bg-foreground text-white')} onClick={() => { setViewMode('single'); setShown(24) }}>单张</button>
            </div>
          </div>
        }
      />

      <FilterRail label="体系">
        <FilterTab active={activeLine === ''} onClick={() => { setLine(''); setCategory('all'); setShown(24) }}>全部 {baseItems.length}</FilterTab>
        {visibleLines.map((l) => (
          <FilterTab key={l} active={activeLine === l} onClick={() => { setLine(l); setCategory('all'); setShown(24) }}>
            {l}{isNsfwPoseSystem(l) ? ' · 18+' : ''}
          </FilterTab>
        ))}
        {safeMode && hiddenNsfwCount > 0 && (
          <FilterTab active={false} onClick={() => requestUnlockNsfw(() => { setLine('全身单人・性感系'); setCategory('all'); setShown(24) })}>
            解锁 18+（{hiddenNsfwCount}）
          </FilterTab>
        )}
      </FilterRail>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setShown(24) }} placeholder="搜索姿势、编号、分类" className="h-12 border-rule bg-white pl-9" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setShown(24) }} className="h-12 border border-rule bg-white px-3 text-sm" aria-label="动作分类">
          <option value="all">全部分类</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className="h-12 border border-rule px-4 text-sm" onClick={() => { setLine(''); setCategory('all'); setAngle(''); setQuery(''); setShown(24) }}>重置</button>
      </div>

      <FilterRail label="视角">
        {['', ...ANGLES].map((a) => (
          <FilterTab key={a || 'all'} active={angle === a} onClick={() => { setAngle(a); setShown(24) }}>{a || '全部视角'}</FilterTab>
        ))}
      </FilterRail>

      {totalCount === 0 ? <EmptyState title="没有找到匹配的姿势" description="换个词，或把筛选清空" /> : viewMode === 'group' ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.slice(0, shown).map((group, gIdx) => {
            const item = getActiveGroupItem(group)
            const picked = recipe.pose?.id === item.id && Boolean(recipe.pose?.useDepth) === poseDepthMode
            return (
              <article key={group.key}>
                <button type="button" onClick={() => setViewer({ groupIndex: gIdx, item })} className="block w-full border border-rule bg-paper">
                  <img src={referenceImageUrl(poseThumbPath(item, poseDepthMode))} alt={`${group.name} · ${item.角度}`} className="aspect-[3/4] w-full object-contain" />
                </button>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl leading-snug">{group.name}</h2>
                    <p className="mt-1 text-xs tracking-wide text-muted-foreground">{group.number} · {item.角度} · {group.category}</p>
                  </div>
                  <button type="button" onClick={() => togglePose(item)} className="inline-flex min-h-11 shrink-0 items-center gap-1 border border-rule px-3 text-xs">
                    {picked ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                    {picked ? '已选' : '加入'}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-1">
                  {ANGLES.map((ang) => {
                    const angItem = group.angles[ang]
                    if (!angItem) return <div key={ang} />
                    const current = angItem.id === item.id
                    return (
                      <button key={ang} type="button" onClick={() => setHoverAngles((prev) => ({ ...prev, [group.key]: ang }))} className={cn('border p-0.5', current ? 'border-cinnabar' : 'border-transparent')}>
                        <img src={referenceImageUrl(poseThumbPath(angItem, poseDepthMode))} alt={ang} className="aspect-square w-full object-cover" />
                        <span className="mt-1 block text-center text-[10px] text-muted-foreground">{ang}</span>
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {filteredSingles.slice(0, shown).map((item) => {
            const picked = recipe.pose?.id === item.id && Boolean(recipe.pose?.useDepth) === poseDepthMode
            const gIdx = filteredGroups.findIndex((g) => g.items.some((x) => x.id === item.id))
            return (
              <article key={item.id}>
                <button type="button" onClick={() => setViewer({ groupIndex: Math.max(0, gIdx), item })} className="block w-full border border-rule bg-paper">
                  <img src={referenceImageUrl(poseThumbPath(item, poseDepthMode))} alt={item.姿势名称} className="aspect-[3/4] w-full object-contain" />
                </button>
                <h2 className="mt-3 font-serif text-lg leading-snug">{item.姿势名称}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{item.角度} · {item.分类}</p>
                <button type="button" onClick={() => togglePose(item)} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm">
                  {picked ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                  {picked ? '已在配方' : '加入配方'}
                </button>
              </article>
            )
          })}
        </div>
      )}

      {shown < totalCount && (
        <button type="button" className="mx-auto min-h-12 border border-rule px-6 text-sm" onClick={() => setShown((s) => s + 24)}>
          再看 {Math.min(24, totalCount - shown)} {viewMode === 'group' ? '组' : '张'}
        </button>
      )}

      <Spread
        open={Boolean(viewer)}
        onOpenChange={(open) => !open && setViewer(null)}
        imageUrl={viewerImage}
        alt={viewer?.item.姿势名称 || ''}
        title={viewer?.item.姿势名称 || ''}
        onPrev={viewerGroup && viewer ? () => {
          const idx = viewerGroup.order.findIndex((x) => x.id === viewer.item.id)
          const next = viewerGroup.order[(idx - 1 + viewerGroup.order.length) % viewerGroup.order.length]
          setViewer({ groupIndex: viewer.groupIndex, item: next })
        } : undefined}
        onNext={viewerGroup && viewer ? () => {
          const idx = viewerGroup.order.findIndex((x) => x.id === viewer.item.id)
          const next = viewerGroup.order[(idx + 1) % viewerGroup.order.length]
          setViewer({ groupIndex: viewer.groupIndex, item: next })
        } : undefined}
      >
        {viewer && (
          <>
            <p className="text-sm text-muted-foreground">{viewer.item.体系} · {viewer.item.分类} · {viewer.item.角度}</p>
            <div className="flex items-center justify-between border-y border-rule py-2 font-mono text-xs">
              <span className="truncate">{viewer.item.id}</span>
              <button type="button" aria-label="复制编号" onClick={() => { void navigator.clipboard.writeText(viewer.item.id); toast.success('已复制编号') }}><CopyIcon className="size-4" /></button>
            </div>
            <div className="flex border border-rule">
              <button type="button" className={cn('min-h-11 flex-1 text-sm', !poseDepthMode && 'bg-foreground text-white')} onClick={() => setPoseDepthMode(false)}>白模</button>
              <button type="button" className={cn('min-h-11 flex-1 text-sm', poseDepthMode && 'bg-foreground text-white')} onClick={() => setPoseDepthMode(true)}>深度图</button>
            </div>
            {viewerGroup && (
              <div className="grid grid-cols-5 gap-1">
                {ANGLES.map((ang) => {
                  const angItem = viewerGroup.angles[ang]
                  if (!angItem) return null
                  return (
                    <button key={ang} type="button" onClick={() => setViewer({ groupIndex: viewer.groupIndex, item: angItem })} className={cn('border p-0.5', angItem.id === viewer.item.id ? 'border-cinnabar' : 'border-transparent')}>
                      <img src={referenceImageUrl(poseThumbPath(angItem, poseDepthMode))} alt={ang} className="aspect-square w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            )}
            <div className="mt-auto flex flex-col gap-2">
              <Button className="min-h-12" onClick={() => togglePose(viewer.item)}>
                {recipe.pose?.id === viewer.item.id && Boolean(recipe.pose?.useDepth) === poseDepthMode ? '从配方移除' : `加入配方（${poseDepthMode ? '深度图' : '白模'}）`}
              </Button>
              <Button variant="outline" className="min-h-12" onClick={() => void downloadRemoteImage(viewerImage, `${viewer.item.id}${poseDepthMode ? '_depth.png' : '.png'}`).catch(() => toast.error('下载失败，请稍后再试'))}>
                <DownloadIcon className="size-4" />下载原图
              </Button>
            </div>
          </>
        )}
      </Spread>
    </>
  )
}
