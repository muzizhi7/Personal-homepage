import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Icon } from '../components/icons'
import { IMAGE_CROP_PRESETS, createCroppedImageFile } from './image-crop'
import type { ImageCropPresetKey } from './image-crop'

interface ImageCropDialogProps {
  sourceUrl: string
  originalFile: File
  presetKey: ImageCropPresetKey
  onCancel: () => void
  onConfirm: (file: File) => Promise<void>
}

export default function ImageCropDialog({
  sourceUrl,
  originalFile,
  presetKey,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const preset = IMAGE_CROP_PRESETS[presetKey]
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [cropPixels, setCropPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const appRoot = document.getElementById('root')
    const rootWasInert = appRoot?.hasAttribute('inert') ?? false
    document.body.style.overflow = 'hidden'
    appRoot?.setAttribute('inert', '')
    requestAnimationFrame(() => dialogRef.current?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
      if (!rootWasInert) appRoot?.removeAttribute('inert')
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onCancel])

  const trapFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const close = () => {
    if (!busy) onCancel()
  }

  const reset = () => {
    if (busy) return
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setError('')
  }

  const confirm = async () => {
    if (!cropPixels || busy) return
    setBusy(true)
    setError('')
    try {
      const file = await createCroppedImageFile(sourceUrl, cropPixels, originalFile, preset)
      await onConfirm(file)
    } catch (e: any) {
      setError(e?.message || '裁切或上传失败')
      setBusy(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        onKeyDown={trapFocus}
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-y-auto rounded-lg border border-line bg-surface shadow-2xl sm:max-h-[calc(100dvh-48px)]"
      >
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="image-crop-title" className="truncate text-[15px] font-semibold text-ink">
              裁切图片
            </h2>
            <p className="text-[11px] text-faint">{preset.label}</p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label="关闭裁切"
            title="关闭"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-40"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="relative h-[clamp(160px,52dvh,520px)] shrink-0 bg-black">
          <Cropper
            image={sourceUrl}
            crop={crop}
            zoom={zoom}
            aspect={preset.aspect}
            minZoom={1}
            maxZoom={3}
            objectFit="contain"
            showGrid
            zoomWithScroll
            roundCropAreaPixels
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, pixels) => setCropPixels(pixels)}
            mediaProps={{ alt: '' }}
            cropperProps={{ 'aria-label': `图片裁切区域，比例 ${preset.label}` }}
          />
        </div>

        <div className="sticky bottom-0 z-20 shrink-0 space-y-4 border-t border-line bg-surface px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <Icon name="image" size={16} className="shrink-0 text-muted" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              disabled={busy}
              onChange={(event) => setZoom(Number(event.target.value))}
              aria-label="图片缩放"
              className="min-w-0 flex-1 accent-[var(--accent)]"
            />
            <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-muted">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              title="重置裁切"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-[12px] font-medium text-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-40"
            >
              <Icon name="reset" size={14} />
              重置
            </button>
          </div>

          {error && (
            <p role="alert" className="text-[12px] text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={busy}
              className="h-10 rounded-lg border border-line px-4 text-[13px] font-semibold text-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-40"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || !cropPixels}
              className="flex h-10 min-w-[116px] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Icon name="upload" size={15} />
              {busy ? '处理中…' : '确认并上传'}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
