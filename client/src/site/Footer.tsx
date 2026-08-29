import { useSite } from '../lib/site'
import { Icon, platformIcon } from '../components/icons'
import { withYear } from '../lib/utils'

export default function Footer() {
  const { site, t } = useSite()
  if (!site) return null
  return (
    <footer className="border-t border-line px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 md:flex-row">
        <p className="text-center text-[13px] text-muted">{withYear(t(site.footer.text))}</p>
        {site.footer.showSocials && (
          <div className="flex gap-2">
            {site.contact.socials
              .filter((s) => s.url)
              .slice(0, 6)
              .map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  title={t(s.label)}
                  aria-label={t(s.label)}
                  className="btn-gradient-hover flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted"
                >
                  <Icon name={platformIcon(s.platform)} size={14} />
                </a>
              ))}
          </div>
        )}
      </div>
    </footer>
  )
}
