import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useSite } from '../lib/site'
import { cn } from '../lib/utils'
import { Aurora, EASE, Magnetic, Marquee, Monogram, SiteButton } from '../components/ui'

/* 逐词浮现 */
function WordReveal({
  text,
  className,
  delay = 0,
  as: Tag = 'h1',
}: {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'span'
}) {
  const words = text.split(' ')
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '115%', opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, delay: delay + i * 0.055, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/* 鼠标聚光 */
function Spotlight() {
  const x = useMotionValue(-600)
  const y = useMotionValue(-600)
  const sx = useSpring(x, { stiffness: 90, damping: 22 })
  const sy = useSpring(y, { stiffness: 90, damping: 22 })
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        x.set(e.clientX - r.left)
        y.set(e.clientY - r.top)
      }}
    >
      <motion.div
        className="absolute h-[520px] w-[520px] rounded-full"
        style={{
          left: sx,
          top: sy,
          x: '-50%',
          y: '-50%',
          background:
            'radial-gradient(circle at center, color-mix(in srgb, var(--accent) 10%, transparent), transparent 65%)',
        }}
      />
    </motion.div>
  )
}

export default function Hero() {
  const { site, t } = useSite()
  const ref = useRef<HTMLElement>(null)
  if (!site) return null
  const h = site.hero

  return (
    <section id="hero" ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <Aurora show={site.theme.showAurora} />
      <Spotlight />

      {/* 底部网格 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 30%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-28 pb-16 md:px-8">
        <div className="flex flex-col-reverse items-center gap-12 md:flex-row md:items-center md:justify-between">
          {/* 文案 */}
          <div className="max-w-2xl text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-7 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[13px] font-medium text-muted"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {t(h.badge)}
            </motion.div>

            <WordReveal
              text={t(h.name)}
              delay={0.15}
              className="mb-3 text-5xl font-bold tracking-tight md:text-6xl"
            />

            <WordReveal
              text={t(h.headline)}
              delay={0.5}
              className="text-gradient mb-6 text-3xl font-bold leading-[1.15] tracking-tight md:text-[2.75rem]"
              as="h2"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
              className="mb-9 text-[17px] leading-relaxed text-muted md:text-lg"
            >
              {t(h.subheadline)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.05, ease: EASE }}
              className="flex flex-wrap items-center justify-center gap-4 md:justify-start"
            >
              <Magnetic>
                <SiteButton href={h.ctaPrimary.href} size="lg">
                  {t(h.ctaPrimary.label)}
                </SiteButton>
              </Magnetic>
              <Magnetic strength={0.2}>
                <SiteButton href={h.ctaSecondary.href} variant="secondary" size="lg" icon="arrow-right">
                  {t(h.ctaSecondary.label)}
                </SiteButton>
              </Magnetic>
            </motion.div>
          </div>

          {/* 头像 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(14px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.6, ease: EASE }}
            className="relative shrink-0"
          >
            <div className="animate-float relative">
              <div
                className="absolute -inset-6 rounded-full opacity-40 blur-2xl"
                style={{
                  background:
                    'conic-gradient(from 120deg, var(--accent), var(--accent-2), var(--accent))',
                }}
              />
              {h.avatar ? (
                <div className="relative overflow-hidden rounded-full border border-line p-1 glass">
                  <img
                    src={h.avatar}
                    alt={t(h.name)}
                    className="h-44 w-44 rounded-full object-cover md:h-52 md:w-52"
                  />
                </div>
              ) : (
                <div className="relative rounded-full border border-line glass p-2">
                  <Monogram text={t(h.name)} size={150} />
                  <span className="animate-pulse-ring absolute inset-2 rounded-full border-2 border-accent/60" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 关键词跑马灯 */}
      {h.badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className={cn('relative z-10 border-y border-line py-4', site.theme.showAurora && 'bg-black/10')}
        >
          <Marquee items={h.badges.map((b) => t(b))} duration={26} />
        </motion.div>
      )}

      {/* 滚动提示 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        onClick={() => {
          const ids = site.layout.sections.filter((k) => k !== 'hero')
          const first = ids.find((k) => site[k].enabled !== false)
          if (first) {
            const el = document.getElementById(first)
            el?.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-faint transition-colors hover:text-muted"
        aria-label="向下滚动"
      >
        <svg width="24" height="34" viewBox="0 0 24 34" fill="none" className="animate-bounce-soft">
          <rect x="1" y="1" width="22" height="32" rx="11" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="10" r="3" fill="currentColor" />
        </svg>
      </motion.button>
    </section>
  )
}
