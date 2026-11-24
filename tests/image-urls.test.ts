import assert from 'node:assert/strict'
import test from 'node:test'
import { referenceImageUrl } from '../src/lib/recipeImages.ts'

test('pose, depth, costume, portrait and shisei paths point at public hosts', () => {
  assert.equal(
    referenceImageUrl('thumbs/full_single_P001_front.jpg'),
    'https://ai-pose-gallery.pages.dev/thumbs/full_single_P001_front.jpg',
  )
  assert.equal(
    referenceImageUrl('/img/depth/full_single_P001_front.webp'),
    'https://ai-pose-depth-gallery.pages.dev/img/full_single_P001_front.png',
  )
  assert.equal(
    referenceImageUrl('thumbs/depth/full_single_P001_front.webp'),
    'https://ai-pose-depth-gallery.pages.dev/thumbs/full_single_P001_front.jpg',
  )
  assert.equal(
    referenceImageUrl('thumbs/costume/SPR-0001.webp'),
    'https://ai-costume-gallery.pages.dev/thumbs/SPR-0001.webp',
  )
  assert.equal(
    referenceImageUrl('img/portrait/f71f980dde3.webp'),
    'https://ai-portrait-gallery.pages.dev/img/full/f71f980dde3.png',
  )
  assert.equal(
    referenceImageUrl('thumbs/costumes/shisei/costume_C001_front.webp'),
    'https://cdn.jsdelivr.net/gh/wquguru/shisei@8f61ceab10e45f8d3afd254900903733a0ba76ee/images/costume/grey/w300/costume_C001_front.webp',
  )
  assert.equal(referenceImageUrl('https://charadb-2fi.pages.dev/thumb/O001.webp'), 'https://charadb-2fi.pages.dev/thumb/O001.webp')
})
