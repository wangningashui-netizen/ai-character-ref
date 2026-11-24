import assert from 'node:assert/strict'
import test from 'node:test'
import { imageFallbackUrl, referenceImageUrl } from '../src/lib/recipeImages.ts'

const MIRROR = 'https://raw.githubusercontent.com/wangningashui-netizen/ai-character-ref-images/main'

test('catalog paths use the image mirror, and an empty prefix keeps the original hosts', () => {
  assert.equal(
    referenceImageUrl('thumbs/full_single_P001_front.jpg'),
    `${MIRROR}/poses/thumbs/full_single_P001_front.jpg`,
  )
  assert.equal(
    referenceImageUrl('thumbs/full_single_P001_front.jpg', ''),
    'https://ai-pose-gallery.pages.dev/thumbs/full_single_P001_front.jpg',
  )
  assert.equal(
    referenceImageUrl('/img/depth/full_single_P001_front.webp'),
    `${MIRROR}/poses-depth/img/full_single_P001_front.png`,
  )
  assert.equal(
    referenceImageUrl('thumbs/depth/full_single_P001_front.webp'),
    `${MIRROR}/poses-depth/thumbs/full_single_P001_front.jpg`,
  )
  assert.equal(
    referenceImageUrl('thumbs/costume/SPR-0001.webp'),
    `${MIRROR}/costumes/thumbs/SPR-0001.webp`,
  )
  assert.equal(
    referenceImageUrl('img/portrait/f71f980dde3.webp'),
    `${MIRROR}/portraits/img/full/f71f980dde3.png`,
  )
  assert.equal(
    referenceImageUrl('thumbs/portrait/f71f980dde3.webp'),
    `${MIRROR}/portraits/img/thumb/f71f980dde3.webp`,
  )
  assert.equal(
    referenceImageUrl('https://ai-costume-anime-gallery.pages.dev/thumbs/SPR-0001.webp'),
    `${MIRROR}/costumes-anime/thumbs/SPR-0001.webp`,
  )
  assert.equal(
    referenceImageUrl('https://charadb-2fi.pages.dev/thumb/O001.webp'),
    `${MIRROR}/charadb/thumb/O001.webp`,
  )
  assert.equal(
    referenceImageUrl('thumbs/costumes/shisei/costume_C001_front.webp'),
    `${MIRROR}/shisei/w300/costume_C001_front.webp`,
  )
  assert.equal(
    referenceImageUrl('img/costumes/shisei/costume_C001_front.webp'),
    `${MIRROR}/shisei/w900/costume_C001_front.webp`,
  )
})

test('a failed mirror URL falls back once to the original host', () => {
  const pose = referenceImageUrl('thumbs/full_single_P001_front.jpg')
  assert.equal(imageFallbackUrl(pose), 'https://ai-pose-gallery.pages.dev/thumbs/full_single_P001_front.jpg')
  assert.equal(imageFallbackUrl('https://ai-pose-gallery.pages.dev/thumbs/full_single_P001_front.jpg'), null)
  assert.equal(
    imageFallbackUrl(referenceImageUrl('thumbs/costumes/shisei/costume_C001_front.webp')),
    'https://cdn.jsdelivr.net/gh/wquguru/shisei@8f61ceab10e45f8d3afd254900903733a0ba76ee/images/costume/grey/w300/costume_C001_front.webp',
  )
  assert.equal(imageFallbackUrl(pose), imageFallbackUrl(pose))
  assert.equal(imageFallbackUrl(imageFallbackUrl(pose) || ''), null)
})
