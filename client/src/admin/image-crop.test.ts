import assert from 'node:assert/strict'
import test from 'node:test'
import { IMAGE_CROP_PRESETS, calculateCropOutputSize, validateImageUpload } from './image-crop.ts'

test('defines the approved crop ratio and output limit for every image context', () => {
  assert.deepEqual(IMAGE_CROP_PRESETS.square, {
    label: '方形 1:1',
    aspect: 1,
    maxWidth: 1024,
    maxHeight: 1024,
    previewClass: 'aspect-square',
  })
  assert.deepEqual(IMAGE_CROP_PRESETS.about, {
    label: '横向 4:3',
    aspect: 4 / 3,
    maxWidth: 1600,
    maxHeight: 1200,
    previewClass: 'aspect-[4/3]',
  })
  assert.deepEqual(IMAGE_CROP_PRESETS.project, {
    label: '横向 2:1',
    aspect: 2,
    maxWidth: 1600,
    maxHeight: 800,
    previewClass: 'aspect-[2/1]',
  })
})

test('bounds large crops without upscaling smaller source pixels', () => {
  assert.deepEqual(calculateCropOutputSize(2400, 1200, IMAGE_CROP_PRESETS.project), {
    width: 1600,
    height: 800,
  })
  assert.deepEqual(calculateCropOutputSize(600, 300, IMAGE_CROP_PRESETS.project), {
    width: 600,
    height: 300,
  })
})

test('rejects non-images and image files larger than 10 MB before cropping', () => {
  assert.equal(validateImageUpload({ type: 'image/jpeg', size: 1024 }), null)
  assert.equal(validateImageUpload({ type: 'text/plain', size: 1024 }), '仅支持图片文件')
  assert.equal(validateImageUpload({ type: 'image/png', size: 10 * 1024 * 1024 + 1 }), '图片不能超过 10MB')
})
