import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useSite } from '../lib/site'
import { SECTION_LABELS } from '../lib/types'
import type { SectionKey } from '../lib/types'
import { cn, scrollToHash } from '../lib/utils'
import { Icon } from '../components/icons'
import { EASE, IconButton, LangToggle } from '../components/ui'
import { resolveProfileAvatar } from './profile-avatar'

export default function Navbar() {
  const { site, t } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<SectionKey>('hero')
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const avatarUrl = site?.hero.avatar ?? ''
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 })

  useEffect(() => setAvatarFailed(false), [avatarUrl])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!site) return
    const ids = site.layout.sections
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id as SectionKey)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [site])

  if (!site) return null

  const profileAvatar = resolveProfileAvatar(avatarUrl, t(site.hero.name))
  const showAvatar = Boolean(profileAvatar.src && !avatarFailed)

  const links = site.layout.sections.filter((k) => {
    if (k === 'hero') return false
    const sec = site[k] as { enabled?: boolean } | undefined
    return sec?.enabled !== false
  })

  const go = (hash: string) => {
    setMenuOpen(false)
    scrollToHash(hash)
  }

  return (
    <>
      {/* 阅读进度条 */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
        style={{ scaleX: progress, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }}
      />
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-all duration-500',
          scrolled ? 'glass shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)]' : 'bg-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              go('#hero')
            }}
            className="flex items-center gap-2.5"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-[15px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              {showAvatar ? (
                <img
                  src={profileAvatar.src!}
                  alt={t(site.hero.name)}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                profileAvatar.initial
              )}
            </span>
            <span className="text-[15px] font-semibold tracking-tight">{t(site.hero.name)}</span>
          </a>

          {/* 桌面导航 */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((k) => (
              <button
                key={k}
                onClick={() => go('#' + k)}
                className={cn(
                  'relative rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-colors',
                  active === k ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {active === k && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-card-strong"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{t(SECTION_LABELS[k])}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LangToggle />
            <Link to="/admin" aria-label="管理后台">
              <IconButton label="管理后台">
                <Icon name="settings" size={16} />
              </IconButton>
            </Link>
            <IconButton className="md:hidden" label="菜单" onClick={() => setMenuOpen((v) => !v)}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={17} />
            </IconButton>
          </div>
        </nav>

        {/* 移动端菜单 */}
        <motion.div
          initial={false}
          animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="overflow-hidden md:hidden"
        >
          <div className="glass mx-4 mb-4 flex flex-col gap-1 rounded-2xl p-2">
            {links.map((k) => (
              <button
                key={k}
                onClick={() => go('#' + k)}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-left text-sm font-medium',
                  active === k ? 'bg-card-strong text-ink' : 'text-muted',
                )}
              >
                {t(SECTION_LABELS[k])}
              </button>
            ))}
          </div>
        </motion.div>
      </header>
    </>
  )
}
