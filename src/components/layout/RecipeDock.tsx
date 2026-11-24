import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from '@tanstack/react-router'
import { DicesIcon, Trash2Icon } from 'lucide-react'
import { costumesQuery, portraitsQuery, posesQuery } from '@/api/gallery'
import { RefImage } from '@/components/common/RefImage'
import { poseThumbPath, referenceImageUrl } from '@/lib/recipeImages'
import { useStudio } from '@/store/studioStore'

function Thumb({ src, label, empty }: { src?: string; label: string; empty: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="size-12 shrink-0 border border-rule bg-paper">
        {src ? <RefImage src={referenceImageUrl(src)} alt="" className="size-full object-cover" /> : null}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="truncate text-xs">{src ? '已选' : empty}</div>
      </div>
    </div>
  )
}

export function RecipeDock() {
  const { pathname } = useLocation()
  const { recipe, setPortrait, setCostume, setPose, clearRecipe, randomizeRecipe } = useStudio()
  const qc = useQueryClient()
  if (pathname.startsWith('/studio') || pathname.startsWith('/settings') || pathname.startsWith('/guide')) return null

  const handleRandom = async () => {
    const [posesRes, costumes, portraits] = await Promise.all([
      qc.ensureQueryData(posesQuery),
      qc.ensureQueryData(costumesQuery),
      qc.ensureQueryData(portraitsQuery),
    ])
    randomizeRecipe({ poses: posesRes.items, costumes, portraits })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="grid flex-1 grid-cols-3 gap-2">
          <button type="button" className="min-h-11 text-left" onClick={() => recipe.portrait && setPortrait(null)}>
            <Thumb src={recipe.portrait?.缩略图} label="人像" empty="未选" />
          </button>
          <button type="button" className="min-h-11 text-left" onClick={() => recipe.costume && setCostume(null)}>
            <Thumb src={recipe.costume?.缩略图} label="服装" empty="未选" />
          </button>
          <button type="button" className="min-h-11 text-left" onClick={() => recipe.pose && setPose(null)}>
            <Thumb src={recipe.pose ? poseThumbPath(recipe.pose) : undefined} label="姿势" empty="未选" />
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void handleRandom()} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-rule px-3 text-sm sm:flex-none">
            <DicesIcon className="size-4" />随机
          </button>
          <button type="button" onClick={clearRecipe} className="inline-flex min-h-11 items-center justify-center border border-rule px-3" aria-label="清空配方">
            <Trash2Icon className="size-4" />
          </button>
          <Link to="/studio" className="inline-flex min-h-11 flex-1 items-center justify-center bg-foreground px-4 text-sm text-white sm:flex-none">
            去合成
          </Link>
        </div>
      </div>
    </div>
  )
}
