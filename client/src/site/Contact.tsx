import { useState } from 'react'
import { useSite } from '../lib/site'
import { Icon } from '../components/icons'
import type { IconName } from '../components/icons'
import { Magnetic, Reveal, Section, SectionHeading, SiteButton } from '../components/ui'
import { platformIcon } from '../components/icons'

function ContactChip({
  icon,
  text,
  href,
}: {
  icon: IconName
  text: string
  href?: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }
  const cls =
    'flex cursor-pointer items-center gap-2.5 rounded-full glass border border-line px-5 py-2.5 text-[13.5px] font-medium transition-all duration-300 hover:-translate-y-0.5'
  const body = (
    <>
      <Icon name={copied ? 'check' : icon} size={15} className={copied ? 'text-emerald-400' : 'text-accent'} />
      <span className="text-ink">{text}</span>
      {copied && <span className="text-emerald-400">✓</span>}
    </>
  )
  if (href && !href.startsWith('mailto:')) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {body}
      </a>
    )
  }
  return (
    <button onClick={copy} className={cls}>
      {body}
    </button>
  )
}

export default function Contact() {
  const { site, t } = useSite()
  if (!site || !site.contact.enabled) return null
  const c = site.contact
  return (
    <Section id="contact" className="bg-surface-soft/50">
      <SectionHeading center eyebrow="Contact" title={t(c.title)} />
      <Reveal>
        <p className="mx-auto mb-12 max-w-xl text-center text-[16px] leading-relaxed text-muted">
          {t(c.subtitle)}
        </p>
      </Reveal>
      <div className="flex flex-col items-center gap-10">
        {c.cta.href && (
          <Magnetic strength={0.25}>
            <SiteButton href={c.cta.href} size="lg" icon="send" className="px-10 py-5 text-lg">
              {t(c.cta.label)}
            </SiteButton>
          </Magnetic>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {c.email && <ContactChip icon="mail" text={c.email} href={`mailto:${c.email}`} />}
          {c.phone && <ContactChip icon="phone" text={c.phone} href={`tel:${c.phone}`} />}
          {t(c.location) && <ContactChip icon="map-pin" text={t(c.location)} />}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {c.socials
            .filter((s) => s.url)
            .map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                title={t(s.label)}
                aria-label={t(s.label)}
                className="btn-gradient-hover glass flex h-12 w-12 items-center justify-center rounded-full border border-line text-muted"
              >
                <Icon name={platformIcon(s.platform)} size={19} />
              </a>
            ))}
        </div>
      </div>
    </Section>
  )
}
