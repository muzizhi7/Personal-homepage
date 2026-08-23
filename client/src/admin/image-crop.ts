export type ImageCropPresetKey = 'square' | 'about' | 'project'

export interface ImageCropPreset {
  label: string
  aspect: number
  maxWidth: number
  maxHeight: number
  previewClass: string
}

export interface CropPixels {
  x: number
  y: number
  width: number
  height: number
}

export const IMAGE_CROP_PRESETS: Record<ImageCropPresetKey, ImageCropPreset> = {
  square: {
    label: '方形 1:1',
    aspect: 1,
    maxWidth: 1024,
    maxHeight: 1024,
    previewClass: 'aspect-square',
  },
  about: {
    label: '横向 4:3',
    aspect: 4 / 3,
    maxWidth: 1600,
    maxHeight: 1200,
    previewClass: 'aspect-[4/3]',
  },
  project: {
    label: '横向 2:1',
    aspect: 2,
    maxWidth: 1600,
    maxHeight: 800,
    previewClass: 'aspect-[2/1]',
  },
}

export function validateImageUpload(file: Pick<File, 'type' | 'size'>) {
  if (!file.type.startsWith('image/')) return '仅支持图片文件'
  if (file.size > 10 * 1024 * 1024) return '图片不能超过 10MB'
  return null
}

export function calculateCropOutputSize(width: number, height: number, preset: ImageCropPreset) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('裁切区域无效')
  }
  const scale = Math.min(1, preset.maxWidth / width, preset.maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function loadImage(sourceUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('无法读取这张图片'))
    image.src = sourceUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('无法生成裁切图片'))),
      type,
      quality,
    )
  })
}

export async function createCroppedImageFile(
  sourceUrl: string,
  cropPixels: CropPixels,
  originalFile: File,
  preset: ImageCropPreset,
) {
  const image = await loadImage(sourceUrl)
  const output = calculateCropOutputSize(cropPixels.width, cropPixels.height, preset)
  const canvas = document.createElement('canvas')
  canvas.width = output.width
  canvas.height = output.height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持图片裁切')

  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    output.width,
    output.height,
  )

  const preservePng = originalFile.type === 'image/png'
  const type = preservePng ? 'image/png' : 'image/webp'
  const extension = preservePng ? 'png' : 'webp'
  const baseName = originalFile.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'image'
  const blob = await canvasToBlob(canvas, type, preservePng ? undefined : 0.92)
  return new File([blob], `${baseName}-cropped.${extension}`, { type, lastModified: Date.now() })
}
