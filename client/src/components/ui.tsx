import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn, hrefKind, scrollToHash } from '../lib/utils'
import { useLang } from '../lib/i18n'
import { Icon } from './icons'
import type { IconName } from './icons'

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ---------- 滚动显现 ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  blur = true,
  className,
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  blur?: boolean
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? 'blur(10px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ---------- 版块容器 ---------- */
export function Section({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('relative scroll-mt-24 px-6 py-24 md:py-32', className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  )
}

/* ---------- 版块标题 ---------- */
export function SectionHeading({
  eyebrow,
  title,
  center,
}: {
  eyebrow?: string
  title: string
  center?: boolean
}) {
  return (
    <Reveal>
      <div className={cn('mb-14', center && 'text-center')}>
        {eyebrow && (
          <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-accent">
            {eyebrow}
          </div>
        )}
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
        <div
          className={cn('mt-5 h-px w-16 bg-gradient-to-r from-accent to-accent-2', center && 'mx-auto')}
        />
      </div>
    </Reveal>
  )
}

/* ---------- 磁吸效果 ---------- */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  )
}

/* ---------- 3D 倾斜卡片 ---------- */
export function TiltCard({
  children,
  className,
  max = 7,
  style,
}: {
  children: ReactNode
  className?: string
  max?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 18 })
  const sry = useSpring(ry, { stiffness: 150, damping: 18 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }
  return (
    <div style={{ perspective: 1100, ...style }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ---------- 数字滚动 ---------- */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const m = value.match(/^([\d.]+)(.*)$/)
  const numeric = !!m
  const target = m ? parseFloat(m[1]) : 0
  const suffix = m ? m[2] : ''
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView || !numeric) return
    let raf = 0
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay((target * eased).toFixed(m![1].includes('.') ? 1 : 0))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, numeric, target])

  return (
    <span ref={ref} className={className}>
      {numeric ? display + suffix : value}
    </span>
  )
}

/* ---------- 跑马灯 ---------- */
export function Marquee({
  items,
  className,
  duration = 30,
}: {
  items: string[]
  className?: string
  duration?: number
}) {
  if (!items.length) return null
  const row = [...items, ...items]
  return (
    <div className={cn('marquee overflow-hidden', className)}>
      <div
        className="marquee-track flex w-max items-center gap-4"
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        {row.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-4 whitespace-nowrap text-sm font-medium tracking-wide text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- 极光背景 ---------- */
export function Aurora({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="aurora-blob aurora-blob-a -left-[12%] -top-[14%] h-[46vw] w-[46vw]"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="aurora-blob aurora-blob-b -right-[14%] top-[16%] h-[42vw] w-[42vw]"
        style={{ background: 'var(--accent-2)' }}
      />
      <div
        className="aurora-blob aurora-blob-c bottom-[-22%] left-[26%] h-[36vw] w-[36vw]"
        style={{ background: 'color-mix(in srgb, var(--accent) 55%, var(--accent-2))' }}
      />
    </div>
  )
}

/* ---------- 头像占位(名字首字) ---------- */
export function Monogram({ text, size = 112 }: { text: string; size?: number }) {
  const ch = (text || '?').trim().charAt(0).toUpperCase()
  return (
    <div
      className="flex select-none items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        boxShadow: '0 20px 60px -18px color-mix(in srgb, var(--accent) 65%, transparent)',
      }}
    >
      {ch}
    </div>
  )
}

/* ---------- 站点按钮(自动识别链接类型) ---------- */
export function SiteButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon = 'arrow-up-right',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  className?: string
  icon?: IconName | null
}) {
  const kind = hrefKind(href)
  const cls = cn(
    'group inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 active:scale-[0.96]',
    size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-[15px]',
    variant === 'primary'
      ? 'text-white shadow-[0_10px_36px_-10px_color-mix(in_srgb,var(--accent)_75%,transparent)] hover:shadow-[0_16px_48px_-10px_color-mix(in_srgb,var(--accent)_85%,transparent)] hover:-translate-y-0.5'
      : 'glass text-ink hover:bg-card-strong hover:-translate-y-0.5',
    className,
  )
  const inner = (
    <span
      className={cls}
      style={
        variant === 'primary'
          ? { background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }
          : undefined
      }
    >
      {children}
      {icon && (
        <Icon
          name={icon}
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </span>
  )
  if (kind === 'anchor') {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          scrollToHash(href)
        }}
      >
        {inner}
      </a>
    )
  }
  if (kind === 'external') {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    )
  }
  return <a href={href}>{inner}</a>
}

/* ---------- 语言切换 ---------- */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      className={cn(
        'group relative inline-flex h-9 items-center overflow-hidden rounded-full border border-line px-3.5 text-[13px] font-semibold transition-colors hover:bg-card',
        className,
      )}
      aria-label="切换语言"
    >
      <motion.span key={lang} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, ease: EASE }} className="tracking-wide">
        {lang === 'zh' ? 'EN' : '中'}
      </motion.span>
    </button>
  )
}

/* ---------- 圆形图标按钮 ---------- */
export function IconButton({
  onClick,
  children,
  className,
  label,
}: {
  onClick?: () => void
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-all duration-300 hover:border-accent/40 hover:bg-card hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}
