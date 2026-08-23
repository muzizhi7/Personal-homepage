import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import { cn } from '../lib/utils'
import { Icon } from '../components/icons'
import type { BText } from '../lib/types'
import { IMAGE_CROP_PRESETS, validateImageUpload } from './image-crop'
import type { ImageCropPresetKey } from './image-crop'

const ImageCropDialog = lazy(() => import('./ImageCropDialog'))

function CropDialogLoading() {
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const appRoot = document.getElementById('root')
    const rootWasInert = appRoot?.hasAttribute('inert') ?? false
    document.body.style.overflow = 'hidden'
    appRoot?.setAttribute('inert', '')
    requestAnimationFrame(() => loadingRef.current?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
      if (!rootWasInert) appRoot?.removeAttribute('inert')
      previousFocus?.focus()
    }
  }, [])

  return createPortal(
    <div
      ref={loadingRef}
      tabIndex={-1}
      role="status"
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/75 backdrop-blur-sm"
    >
      <span className="rounded-lg border border-line bg-surface px-4 py-3 text-[13px] font-medium text-ink shadow-2xl">
        加载裁切工具…
      </span>
    </div>,
    document.body,
  )
}

/* ---------- 基础 ---------- */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">{label}</span>
        {hint && <span className="text-[11px] text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition-all duration-200 focus:border-accent/60 focus:ring-2 focus:ring-accent/20'

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      className={cn(inputCls, 'resize-y leading-relaxed')}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select className={cn(inputCls, 'cursor-pointer appearance-none')} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ---------- 双语输入 ---------- */
export function LangInput({
  value,
  onChange,
  multiline,
  rows = 2,
  placeholder,
}: {
  value: BText
  onChange: (v: BText) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
}) {
  const set = (k: 'zh' | 'en', v: string) => onChange({ zh: k === 'zh' ? v : value?.zh || '', en: k === 'en' ? v : value?.en || '' })
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['zh', 'en'] as const).map((k) => (
        <div key={k} className="relative">
          {multiline ? (
            <TextArea value={value?.[k] || ''} rows={rows} onChange={(v) => set(k, v)} placeholder={placeholder} />
          ) : (
            <TextInput value={value?.[k] || ''} onChange={(v) => set(k, v)} placeholder={placeholder} />
          )}
          <span
            className={cn(
              'pointer-events-none absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold',
              k === 'zh' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400',
            )}
          >
            {k === 'zh' ? '中文' : 'EN'}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---------- 开关 ---------- */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="group flex items-center gap-2.5">
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
          checked ? 'bg-accent' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </span>
      {label && <span className="text-[13px] font-medium text-ink">{label}</span>}
    </button>
  )
}

/* ---------- 颜色 ---------- */
export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line"
        style={{ background: value }}
      >
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#0a84ff'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -inset-2 h-16 w-16 cursor-pointer opacity-0"
        />
      </label>
      <input
        className={cn(inputCls, 'flex-1 font-mono')}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
        }}
      />
    </div>
  )
}

/* ---------- 标签输入 ---------- */
export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [text, setText] = useState('')
  const add = () => {
    const t = text.trim().replace(/,/g, '')
    if (t && !value.includes(t)) onChange([...value, t])
    setText('')
  }
  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-accent"
              style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                <Icon name="close" size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        className={inputCls}
        value={text}
        placeholder={placeholder || '输入后回车添加'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
      />
    </div>
  )
}

/* ---------- 图片选择 ---------- */
export function ImagePicker({
  value,
  onChange,
  cropPreset = 'project',
}: {
  value: string
  onChange: (v: string) => void
  cropPreset?: ImageCropPresetKey
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pending, setPending] = useState<{ file: File; sourceUrl: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const preset = IMAGE_CROP_PRESETS[cropPreset]

  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.sourceUrl)
    }
  }, [pending])

  const chooseImage = async (file?: File) => {
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    const validationError = validateImageUpload(file)
    if (validationError) {
      setErr(validationError)
      return
    }
    setBusy(true)
    setErr('')
    const sourceUrl = URL.createObjectURL(file)
    try {
      await new Promise<void>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('无法读取这张图片'))
        image.src = sourceUrl
      })
      setPending({ file, sourceUrl })
    } catch (e: any) {
      URL.revokeObjectURL(sourceUrl)
      setErr(e?.message || '无法读取这张图片')
    } finally {
      setBusy(false)
    }
  }

  const uploadCropped = async (file: File) => {
    setBusy(true)
    setErr('')
    try {
      onChange(await api.upload(file))
      setPending(null)
    } catch (e: any) {
      setErr(e?.message || '上传失败')
      throw e
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-line">
          <img src={value} alt="" className={cn('w-full object-cover', preset.previewClass)} />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-lg bg-white/95 px-3.5 py-1.5 text-[12px] font-semibold text-black transition-transform hover:scale-105"
            >
              更换图片
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={busy}
              className="rounded-lg bg-red-500/95 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-transform hover:scale-105"
            >
              移除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line text-faint transition-colors hover:border-accent/50 hover:text-muted',
            preset.previewClass,
          )}
        >
          {busy ? (
            <span className="text-[13px]">读取图片中…</span>
          ) : (
            <>
              <Icon name="upload" size={22} />
              <span className="text-[12px]">点击上传图片（≤10MB）</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => chooseImage(event.target.files?.[0])}
      />
      <input
        className={cn(inputCls, 'font-mono text-[12px]')}
        value={value}
        placeholder="或直接粘贴图片 URL"
        onChange={(e) => onChange(e.target.value)}
      />
      {err && <p className="text-[12px] text-red-400">{err}</p>}
      {pending && (
        <Suspense fallback={<CropDialogLoading />}>
          <ImageCropDialog
            sourceUrl={pending.sourceUrl}
            originalFile={pending.file}
            presetKey={cropPreset}
            onCancel={() => setPending(null)}
            onConfirm={uploadCropped}
          />
        </Suspense>
      )}
    </div>
  )
}

/* ---------- 数值/滑块 ---------- */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  suffix = '',
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  suffix?: string
  step?: number
}) {
  const fmt = step < 1 ? Number(value).toFixed(2) : String(value)
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--accent)]"
      />
      <span className="w-16 shrink-0 rounded-lg border border-line bg-surface-soft px-2 py-1 text-center text-[12.5px] tabular-nums text-ink">
        {fmt}
        {suffix}
      </span>
    </div>
  )
}

/* ---------- 列表编辑器 ---------- */
function IconBtn({
  onClick,
  children,
  danger,
  disabled,
}: {
  onClick: () => void
  children: ReactNode
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-card disabled:opacity-30',
        danger && 'hover:border-red-500/50 hover:text-red-400',
      )}
    >
      {children}
    </button>
  )
}

export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  addLabel = '添加一项',
  max = 20,
}: {
  items: T[]
  onChange: (v: T[]) => void
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode
  create: () => T
  addLabel?: string
  max?: number
}) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const copy = [...items]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    onChange(copy)
  }
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)))
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface-soft/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider text-faint">
              #{i + 1}
            </span>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => move(i, -1)} disabled={i === 0}>
                <Icon name="arrow-up" size={14} />
              </IconBtn>
              <IconBtn onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                <Icon name="arrow-down" size={14} />
              </IconBtn>
              <IconBtn danger onClick={() => onChange(items.filter((_, k) => k !== i))}>
                <Icon name="trash" size={14} />
              </IconBtn>
            </div>
          </div>
          {render(it, (patch) => update(i, patch))}
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-3 text-[13px] font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Icon name="plus" size={15} /> {addLabel}
        </button>
      )}
    </div>
  )
}

/* ---------- 版块卡片 ---------- */
export function SectionCard({
  title,
  desc,
  enabled,
  onToggle,
  children,
}: {
  title: string
  desc?: string
  enabled?: boolean
  onToggle?: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-line bg-card p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-ink">{title}</h3>
          {desc && <p className="mt-0.5 text-[12.5px] text-muted">{desc}</p>}
        </div>
        {typeof enabled === 'boolean' && onToggle && <Toggle checked={enabled} onChange={onToggle} />}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
