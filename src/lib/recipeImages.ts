import type { CostumeItem, PortraitItem, PoseItem, RecipeState } from '@/types/gallery'

const POSE_ORIGIN = 'https://ai-pose-gallery.pages.dev/'
const DEPTH_ORIGIN = 'https://ai-pose-depth-gallery.pages.dev/'
const COSTUME_ORIGIN = 'https://ai-costume-gallery.pages.dev/'
const PORTRAIT_ORIGIN = 'https://ai-portrait-gallery.pages.dev/'
const ANIME_ORIGIN = 'https://ai-costume-anime-gallery.pages.dev/'
const CHARADB_ORIGIN = 'https://charadb-2fi.pages.dev/'
const SHISEI_REV = '8f61ceab10e45f8d3afd254900903733a0ba76ee'
const SHISEI_ORIGIN = `https://cdn.jsdelivr.net/gh/wquguru/shisei@${SHISEI_REV}/images/costume/grey/`

/** 空字符串表示仍从原站读取。 */
export const IMAGE_MIRROR_PREFIX = 'https://raw.githubusercontent.com/wangningashui-netizen/ai-character-ref-images/main'

const MIRROR_HOSTS = [
  { host: DEPTH_ORIGIN, folder: 'poses-depth' },
  { host: ANIME_ORIGIN, folder: 'costumes-anime' },
  { host: COSTUME_ORIGIN, folder: 'costumes' },
  { host: PORTRAIT_ORIGIN, folder: 'portraits' },
  { host: CHARADB_ORIGIN, folder: 'charadb' },
  { host: POSE_ORIGIN, folder: 'poses' },
] as const

function mirrorRoot(prefix = IMAGE_MIRROR_PREFIX) {
  return prefix.replace(/\/+$/, '')
}

/** 目录里的相对路径，以及已经写好的原站地址，都还原成原站 URL。 */
export function originalReferenceUrl(src: string): string {
  if (!src) return src
  if (/^(data:|blob:)/i.test(src)) return src
  if (/^https?:\/\//i.test(src)) return src
  const clean = src.replace(/^\/+/, '')

  const shiseiThumb = clean.match(/^thumbs\/costumes\/shisei\/(.+)$/i)
  if (shiseiThumb) return `${SHISEI_ORIGIN}w300/${shiseiThumb[1]}`
  const shiseiFull = clean.match(/^img\/costumes\/shisei\/(.+)$/i)
  if (shiseiFull) return `${SHISEI_ORIGIN}w900/${shiseiFull[1]}`

  const depthThumb = clean.match(/^thumbs\/depth\/(.+)\.webp$/i)
  if (depthThumb) return `${DEPTH_ORIGIN}thumbs/${depthThumb[1]}.jpg`
  const depthFull = clean.match(/^img\/depth\/(.+)\.webp$/i)
  if (depthFull) return `${DEPTH_ORIGIN}img/${depthFull[1]}.png`

  const portraitThumb = clean.match(/^thumbs\/portrait\/(.+)$/i)
  if (portraitThumb) return `${PORTRAIT_ORIGIN}img/thumb/${portraitThumb[1]}`
  const portraitFull = clean.match(/^img\/portrait\/(.+)\.webp$/i)
  if (portraitFull) return `${PORTRAIT_ORIGIN}img/full/${portraitFull[1]}.png`

  const costumeThumb = clean.match(/^thumbs\/costume\/(.+)$/i)
  if (costumeThumb) return `${COSTUME_ORIGIN}thumbs/${costumeThumb[1]}`
  const costumeWebp = clean.match(/^img\/costume\/(.+)\.webp$/i)
  if (costumeWebp) return `${COSTUME_ORIGIN}img/${costumeWebp[1]}.webp`
  const costumePng = clean.match(/^img\/costume\/(.+)\.png$/i)
  if (costumePng) return `${COSTUME_ORIGIN}png/${costumePng[1]}.png`

  if (clean.startsWith('thumbs/') || clean.startsWith('img/')) return `${POSE_ORIGIN}${clean}`
  return src
}

export function mirrorFromOriginal(originalUrl: string, prefix = IMAGE_MIRROR_PREFIX): string {
  if (!prefix || !/^https?:\/\//i.test(originalUrl)) return originalUrl
  if (originalUrl.startsWith(SHISEI_ORIGIN)) {
    return `${mirrorRoot(prefix)}/shisei/${originalUrl.slice(SHISEI_ORIGIN.length)}`
  }
  for (const { host, folder } of MIRROR_HOSTS) {
    if (originalUrl.startsWith(host)) {
      return `${mirrorRoot(prefix)}/${folder}/${originalUrl.slice(host.length)}`
    }
  }
  return originalUrl
}

/** 镜像地址失败时，还原成只试一次的原站地址。不是镜像地址则返回空。 */
export function imageFallbackUrl(failedUrl: string, prefix = IMAGE_MIRROR_PREFIX): string | null {
  if (!prefix) return null
  const base = `${mirrorRoot(prefix)}/`
  if (!failedUrl.startsWith(base)) return null
  const rest = failedUrl.slice(base.length)
  if (rest.startsWith('shisei/')) return `${SHISEI_ORIGIN}${rest.slice('shisei/'.length)}`
  for (const { host, folder } of MIRROR_HOSTS) {
    const folderPrefix = `${folder}/`
    if (rest.startsWith(folderPrefix)) return host + rest.slice(folderPrefix.length)
  }
  return null
}

export function referenceImageUrl(src: string, prefix = IMAGE_MIRROR_PREFIX): string {
  return mirrorFromOriginal(originalReferenceUrl(src), prefix)
}

export async function fetchWithImageFallback(url: string, init?: RequestInit): Promise<Response> {
  try {
    const first = await fetch(url, init)
    if (first.ok) return first
    const next = imageFallbackUrl(url)
    if (!next || next === url) return first
    return await fetch(next, init)
  } catch (error) {
    const next = imageFallbackUrl(url)
    if (!next || next === url) throw error
    return await fetch(next, init)
  }
}

export async function downloadRemoteImage(url: string, filename: string) {
  const response = await fetchWithImageFallback(url)
  if (!response.ok) throw new Error('下载失败')
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

export function poseThumbPath(pose: PoseItem, useDepth = Boolean(pose.useDepth)): string {
  const raw = pose.缩略图
  if (pose.source === 'upload' || !useDepth || /^(data:|blob:|https?:\/\/)/i.test(raw)) return raw
  const clean = raw.replace(/^\/+/, '')
  if (clean.startsWith('thumbs/depth/')) return raw
  if (clean.startsWith('thumbs/')) {
    return `thumbs/depth/${clean.slice('thumbs/'.length).replace(/\.(jpe?g|png)$/i, '.webp')}`
  }
  return raw
}

export function poseImagePath(pose: PoseItem, useDepth = Boolean(pose.useDepth)): string {
  const raw = pose.原图 || pose.缩略图
  if (pose.source === 'upload' || !useDepth || /^(data:|blob:|https?:\/\/)/i.test(raw)) return raw
  const clean = raw.replace(/^\/+/, '')
  if (clean.startsWith('img/depth/')) return raw
  if (clean.startsWith('img/')) {
    return `img/depth/${clean.slice('img/'.length).replace(/\.(png|jpe?g)$/i, '.webp')}`
  }
  return raw
}

export function uploadedReferences(name: string, url: string, width: number, height: number, bytes: number) {
  const base = { id: crypto.randomUUID(), source: 'upload' as const, 原图: url, 缩略图: url, 检索: name }
  const portrait: PortraitItem = {
    ...base, 分区: '上传', 发长: '', 发型名称: name, 标题: name,
    宽: width, 高: height, 字节数: bytes, 精选: false, 热门: false,
  }
  const costume: CostumeItem = {
    ...base, 分类: '上传', 服装名称: name, 标签: [], 关键词: '', 预览图: url,
  }
  const pose: PoseItem = {
    ...base, 体系: '上传', 姿势编号: '', 分类: '上传', 姿势名称: name, 角度: '',
  }
  return { portrait, costume, pose }
}

export function recipeBackup(recipe: RecipeState): RecipeState {
  return {
    portrait: recipe.portrait?.source === 'upload' ? null : recipe.portrait,
    costume: recipe.costume?.source === 'upload' ? null : recipe.costume,
    pose: recipe.pose?.source === 'upload' ? null : recipe.pose,
    extraImages: [],
    workflowImages: {},
  }
}
