# 如水·角色参考

给自己用的中文角色参考站：姿势、服装、人像，以及一个在浏览器里出图的合成台。

打开方式（部署之后）：<https://wangningashui-netizen.github.io/ai-character-ref/>

## 怎么用

1. 在「姿势 / 服装 / 人像」里挑选，点「加入配方」。
2. 安全模式默认开着，18+ 内容是藏起来的。未满 18 岁不要关。
3. 到「合成台」可以随机换一套、看参考拼图、选画风，再生成。
4. 到「密钥」填自己的 Gemini、OpenAI、百炼千问、火山方舟豆包，或本机 ComfyUI 地址。密钥只存在这台设备的浏览器里。

## 图片放在哪里

原项目大约 1.1 GB、一万多张图，超过 GitHub Pages 大约 1 GB 的发布上限，也不适合塞进仓库。

这个站点只保存中文目录（大约 4 MB）。图片在打开时从原作者的公开站点读取，并且这些站点允许网页跨域使用，所以灯箱、下载和参考拼图可以正常工作：

| 内容 | 读取地址 |
| --- | --- |
| 姿势白模 | https://ai-pose-gallery.pages.dev/ |
| 姿势深度图 | https://ai-pose-depth-gallery.pages.dev/ |
| 写实服装 | https://ai-costume-gallery.pages.dev/ |
| 人像 | https://ai-portrait-gallery.pages.dev/ |
| 动漫服装 | https://ai-costume-anime-gallery.pages.dev/ |
| 二次元服装 | https://charadb-2fi.pages.dev/ |
| 中国历代服装 | jsDelivr 上的 [Shisei](https://github.com/wquguru/shisei) 固定版本 |

如果某个原站关闭，对应图片会打不开，目录文字还在。

## 没有带上的部分

Cloudflare 的 `/api/proxy` 中转没有部署。五家云端接口允许浏览器直接访问，所以合成台改为直连，不再经过本站服务器。ComfyUI 自定义节点和 Agent 技能包也不在这个网站里；合成台仍然可以连接你自己电脑上的 ComfyUI。

## 发布到 GitHub Pages

仓库里的 `.github/workflows/pages.yml` 会在合并到 `main` 之后构建并发布。

需要在 GitHub 仓库设置里把 Pages 的来源改成 **GitHub Actions**（Settings → Pages → Build and deployment → Source: GitHub Actions）。没改的话，工作流即使成功也不会变成网站。

站点路径是 `/ai-character-ref/`。直接打开子页面时，构建会放一份 `404.html`，GitHub Pages 会把它交回给页面自己处理。

## 致谢

图片与原始数据属于 ギア（@giaaibusi）和 たき AI（@taki_auto，CharaDB），以及 Shisei / wquguru。中文程序来自 [anhao/ai-pose-gallery-zh](https://github.com/anhao/ai-pose-gallery-zh)（MIT，只覆盖代码）。详见站内「致谢」页和 `LICENSE`。

## 本地预览

需要 Node.js 22 和 pnpm。

```bash
pnpm install
pnpm dev
```

开发地址：<http://localhost:5173/ai-character-ref/>
