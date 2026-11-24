import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { costumesQuery, isNsfwCostume, isNsfwPose, portraitsQuery, posesQuery } from '@/api/gallery'
import { RefImage } from '@/components/common/RefImage'
import { referenceImageUrl } from '@/lib/recipeImages'
import { useStudio } from '@/store/studioStore'

export const Route = createFileRoute('/')({
  staticData: { title: '本期' },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(posesQuery),
      context.queryClient.ensureQueryData(costumesQuery),
      context.queryClient.ensureQueryData(portraitsQuery),
    ]),
  component: HomePage,
})

function HomePage() {
  const { data: posesData } = useSuspenseQuery(posesQuery)
  const { data: costumes } = useSuspenseQuery(costumesQuery)
  const { data: portraits } = useSuspenseQuery(portraitsQuery)
  const { recipe, togglePortrait } = useStudio()

  const poseGroups = posesData.groups.filter((g) => !isNsfwPose(g))
  const costumeItems = costumes.filter((c) => !isNsfwCostume(c))
  const topPortraits = portraits.filter((p) => p.热门).slice(0, 8)
  const leadPose = poseGroups[0]?.order[0]
  const leadCostume = costumeItems[0]
  const leadPortrait = portraits.find((p) => p.精选) || portraits[0]

  return (
    <div className="flex flex-col gap-14">
      <section className="grid items-end gap-8 border-b border-rule pb-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-cinnabar">2026 · 冬刊 · NO. 01</p>
          <h2 className="mt-4 max-w-xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            把一张脸、<br />一身衣服、<br />一个姿势，放在一起。
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">
          这里收录 {posesData.groups.length.toLocaleString('zh-CN')} 组姿势、{costumes.length.toLocaleString('zh-CN')} 套服装和 {portraits.length.toLocaleString('zh-CN')} 张人像。先挑参考，再去合成台，用你自己的密钥出图。安全模式默认开着，18+ 内容不会出现。
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-12 md:gap-6">
        <Link to="/poses" className="group md:col-span-7">
          <figure>
            <div className="overflow-hidden border border-rule bg-paper">
              {leadPose && (
                <RefImage src={referenceImageUrl(leadPose.缩略图)} alt={leadPose.姿势名称} className="h-[210px] w-full object-contain md:h-auto md:max-h-[520px] md:aspect-[5/4]" />
              )}
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-cinnabar">01 · 姿势</p>
                <h3 className="mt-1 font-serif text-3xl">{leadPose?.姿势名称}</h3>
              </div>
              <span className="text-sm text-muted-foreground">{posesData.items.length.toLocaleString('zh-CN')} 张</span>
            </figcaption>
          </figure>
        </Link>
        <div className="grid gap-8 md:col-span-5">
          <Link to="/costumes" className="group">
            <figure>
              <div className="overflow-hidden border border-rule bg-paper">
                {leadCostume && <RefImage src={referenceImageUrl(leadCostume.缩略图)} alt={leadCostume.服装名称} className="aspect-[4/3] w-full object-contain" />}
              </div>
              <figcaption className="mt-3">
                <p className="text-[11px] tracking-[0.22em] text-cinnabar">02 · 服装</p>
                <h3 className="mt-1 font-serif text-2xl">{leadCostume?.服装名称}</h3>
              </figcaption>
            </figure>
          </Link>
          <Link to="/portraits" className="group">
            <figure>
              <div className="overflow-hidden border border-rule bg-paper">
                {leadPortrait && <RefImage src={referenceImageUrl(leadPortrait.缩略图)} alt={leadPortrait.标题} className="aspect-[4/3] w-full object-cover object-top" />}
              </div>
              <figcaption className="mt-3">
                <p className="text-[11px] tracking-[0.22em] text-cinnabar">03 · 人像</p>
                <h3 className="mt-1 font-serif text-2xl">{leadPortrait?.发型名称}</h3>
              </figcaption>
            </figure>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between border-b border-rule pb-3">
          <h2 className="font-serif text-3xl">热门人像</h2>
          <Link to="/portraits" className="min-h-11 text-sm text-cinnabar">全部人像</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
          {topPortraits.map((item, index) => {
            const picked = recipe.portrait?.id === item.id
            return (
              <button key={item.id} type="button" onClick={() => togglePortrait(item)} className="text-left">
                <div className="border border-rule bg-paper">
                  <RefImage src={referenceImageUrl(item.缩略图)} alt={item.标题} className="aspect-[4/5] w-full object-cover object-top" />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="font-serif text-lg">{item.发型名称}</span>
                  <span className="font-serif text-sm text-cinnabar">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{picked ? '已放入配方' : `${item.发长} · 点一下加入配方`}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 border-t border-rule pt-8 text-sm leading-7 text-muted-foreground md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-foreground">致谢与来源</h2>
          <p className="mt-3">
            姿势、写实服装与人像来自 ギア（@giaaibusi）的公开图库。二次元服装来自 たき AI（@taki_auto）的 CharaDB。中国历代服装来自 Shisei / wquguru。中文整理与合成台源自 Anhao 的开源项目。图片不随本站打包，打开时从原站读取。
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-foreground">请这样使用</h2>
          <p className="mt-3">
            只供自己学习、练构图和合法创作。不要用来做违法内容，也不要拿别人的照片换脸。未满 18 岁请保持安全模式。密钥只存在你自己的浏览器里。
            <Link to="/guide" className="ml-2 text-cinnabar">阅读完整说明</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
