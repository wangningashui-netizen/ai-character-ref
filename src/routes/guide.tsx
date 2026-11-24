import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guide')({
  staticData: { title: '致谢' },
  component: GuidePage,
})

function GuidePage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="border-b border-rule pb-6">
        <p className="text-[11px] tracking-[0.28em] text-cinnabar">致谢 · 来源 · 说明</p>
        <h1 className="mt-3 font-serif text-5xl leading-none">怎么用，以及图片从哪来</h1>
      </header>

      <section className="space-y-3 text-sm leading-7">
        <h2 className="font-serif text-2xl">三步合成</h2>
        <p>在人像、服装、姿势里各挑一张，点「加入配方」。底部会记住这三张。到合成台可以随机换一套、导出参考拼图，再选一种画风。</p>
        <p>出图需要你自己的密钥。打开「密钥」，选 Gemini、OpenAI、百炼千问、火山方舟豆包，或本机 ComfyUI。密钥只写在这台手机或电脑的浏览器里，不会上传到这个网站。</p>
      </section>

      <section className="space-y-3 text-sm leading-7">
        <h2 className="font-serif text-2xl">请这样使用</h2>
        <p>这个网站只供自己学习、看人体动态、练构图和合法创作。不要用来制作或传播违法内容，也不要在没有同意的情况下用真人照片换脸。</p>
        <p>图库里有一部分 18+ 的姿势和服装。安全模式默认开着，这些内容是藏起来的。未满 18 岁不要关闭安全模式。</p>
        <p>生成发生在你选择的服务商或你自己的电脑上。这个网站不保存你上传的图，也不保存生成结果。用了之后的责任由使用者自己承担。</p>
      </section>

      <section className="space-y-3 text-sm leading-7">
        <h2 className="font-serif text-2xl">致谢与来源</h2>
        <p>
          姿势、写实服装和人像的图片与原始资料属于 <strong className="font-medium text-foreground">ギア（@giaaibusi）</strong>。原站分别是
          {' '}<a className="text-cinnabar" href="https://ai-pose-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">姿势</a>、
          <a className="text-cinnabar" href="https://ai-pose-depth-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">深度图</a>、
          <a className="text-cinnabar" href="https://ai-costume-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">服装</a>、
          <a className="text-cinnabar" href="https://ai-portrait-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">人像</a>。
          人像为 CC0。姿势和写实服装只供个人学习参考，不要把原图打包拿去卖。
        </p>
        <p>
          440 套二次元服装来自 <a className="text-cinnabar" href="https://charadb-2fi.pages.dev/" target="_blank" rel="noopener noreferrer">たき AI（@taki_auto）的 CharaDB</a>。
          标签可按 CC0 使用，图片从原站读取，只供参考，禁止用于真人、未成年人，也禁止再分发。详见
          {' '}<a className="text-cinnabar" href="https://github.com/taki-ttt/charadb/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">原作者说明</a>。
        </p>
        <p>
          动漫服装图片来自 <a className="text-cinnabar" href="https://ai-costume-anime-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">ギア动漫服装站</a>。
          中国历代服装来自 <a className="text-cinnabar" href="https://github.com/wquguru/shisei" target="_blank" rel="noopener noreferrer">Shisei / wquguru</a>（CC0），是 AI 参考，不是专业历史复原。
        </p>
        <p>
          中文目录、检索和合成台的程序来自 <a className="text-cinnabar" href="https://github.com/anhao/ai-pose-gallery-zh" target="_blank" rel="noopener noreferrer">Anhao 的 ai-pose-gallery-zh</a>（MIT，只覆盖程序，不覆盖图片）。
          本站是重新排过版的个人副本，演示站见 <a className="text-cinnabar" href="https://ai-pose-gallery.anhao.app/" target="_blank" rel="noopener noreferrer">ai-pose-gallery.anhao.app</a>。
        </p>
        <p>为了能放上 GitHub Pages，本仓库只保存文字目录。大图在你打开时从上面的原站读取。如果原站关闭，对应图片会打不开。</p>
      </section>

      <section className="space-y-3 text-sm leading-7">
        <h2 className="font-serif text-2xl">这个副本没有带上的部分</h2>
        <p>原项目里的 ComfyUI 自定义节点、Cloudflare 中转和 Agent 技能包没有放进这个网站。合成台仍然可以直接连接你自己电脑上的 ComfyUI。云端的五家接口由浏览器直连，不再经过网站服务器。</p>
      </section>
    </article>
  )
}
