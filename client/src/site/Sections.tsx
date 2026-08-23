import { motion } from 'framer-motion'
import { useSite } from '../lib/site'
import { Icon } from '../components/icons'
import type { ProjectItem } from '../lib/types'
import { CountUp, EASE, Reveal, Section, SectionHeading, TiltCard } from '../components/ui'

/* ================= 关于我 ================= */
export function About() {
  const { site, t } = useSite()
  if (!site || !site.about.enabled) return null
  const a = site.about
  return (
    <Section id="about" className="bg-surface-soft/50">
      <div className="grid gap-14 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
        <div>
          <SectionHeading eyebrow="About" title={t(a.title)} />
          <div className="space-y-5 text-[16.5px] leading-[1.85] text-muted">
            {a.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p>{t(p)}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.15}>
          <div className="flex h-full flex-col justify-center gap-4">
            {a.avatar && (
              <div className="glass overflow-hidden rounded-[var(--radius)] border border-line">
                <img src={a.avatar} alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {a.highlights.map((hl, i) => (
                <div key={i} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-accent"
                    style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
                  >
                    <Icon name="check" size={14} />
                  </span>
                  <span className="text-sm font-medium">{t(hl)}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/* ================= 数据统计 ================= */
export function Stats() {
  const { site, t } = useSite()
  if (!site || !site.stats.enabled) return null
  const s = site.stats
  return (
    <Section id="stats" className="py-20 md:py-24">
      {t(s.title) && (
        <SectionHeading center eyebrow="Stats" title={t(s.title)} />
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {s.items.map((it, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <TiltCard
              max={5}
              className="glass rounded-[var(--radius)] border border-line p-7 text-center md:p-9"
            >
              <div className="text-gradient text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
                <CountUp value={it.value} />
              </div>
              <div className="mt-2.5 text-[13.5px] font-medium text-muted">{t(it.label)}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ================= 工作经历 ================= */
export function Experience() {
  const { site, t } = useSite()
  if (!site || !site.experience.enabled) return null
  const x = site.experience
  return (
    <Section id="experience" className="bg-surface-soft/50">
      <SectionHeading eyebrow="Career" title={t(x.title)} />
      <div className="relative ml-2 border-l border-line pl-8 md:ml-4 md:pl-12">
        {x.items.map((item, i) => (
          <Reveal key={i} delay={i * 0.08} className="relative pb-12 last:pb-0">
            <span className="absolute -left-[41px] top-2 flex h-4 w-4 items-center justify-center md:-left-[57px]">
              <span className="absolute h-4 w-4 rounded-full bg-accent/25 [animation:pulse-ring_2.4s_cubic-bezier(0.2,0.6,0.4,1)_infinite]" />
              <span
                className="relative h-2.5 w-2.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
              />
            </span>
            <div className="glass rounded-[var(--radius)] border border-line p-6 transition-transform duration-300 hover:-translate-y-1 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{t(item.role)}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
                    <span className="font-medium text-ink">{t(item.company)}</span>
                    {t(item.location) && <span>· {t(item.location)}</span>}
                  </div>
                </div>
                <span className="glass rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-muted">
                  {t(item.period)}
                </span>
              </div>
              {t(item.description) && (
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{t(item.description)}</p>
              )}
              {item.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="rounded-full px-3 py-1 text-[12px] font-medium text-accent"
                      style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ================= 教育背景 ================= */
export function Education() {
  const { site, t } = useSite()
  if (!site || !site.education.enabled) return null
  const e = site.education
  return (
    <Section id="education">
      <SectionHeading eyebrow="Education" title={t(e.title)} />
      <div className="grid gap-5 md:grid-cols-2">
        {e.items.map((item, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="glass h-full rounded-[var(--radius)] border border-line p-7 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-accent"
                  style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
                >
                  <Icon name="graduation" size={20} />
                </div>
                <span className="glass rounded-full px-3 py-1 text-[12.5px] font-medium text-muted">
                  {t(item.period)}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{t(item.school)}</h3>
              <div className="mt-1 text-[14px] font-medium text-accent">{t(item.degree)}</div>
              {t(item.description) && (
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{t(item.description)}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ================= 技能栈 ================= */
export function Skills() {
  const { site, t } = useSite()
  if (!site || !site.skills.enabled) return null
  const s = site.skills
  return (
    <Section id="skills" className="bg-surface-soft/50">
      <SectionHeading eyebrow="Skills" title={t(s.title)} />
      <div className="grid gap-6 md:grid-cols-3">
        {s.groups.map((g, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass h-full rounded-[var(--radius)] border border-line p-7">
              <h3 className="mb-6 text-lg font-bold tracking-tight">{t(g.name)}</h3>
              <div className="space-y-5">
                {g.items.map((it, j) => (
                  <div key={j}>
                    <div className="mb-2 flex items-center justify-between text-[13.5px]">
                      <span className="font-medium">{it.name}</span>
                      <span className="text-muted tabular-nums">{it.level}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${it.level}%` }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 1.1, delay: 0.15 + j * 0.07, ease: EASE }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ================= 项目 ================= */
function ProjectMedia({ item }: { item: ProjectItem }) {
  const { t } = useSite()
  if (item.image) return <img src={item.image} alt={t(item.name)} className="h-full w-full object-cover" />
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent-2) 20%, transparent))',
      }}
    >
      <span className="select-none text-7xl font-black text-white/20">
        {(t(item.name) || '?').charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function ProjectCard({ item }: { item: ProjectItem }) {
  const { t } = useSite()
  return (
    <TiltCard max={5} className="group glass h-full overflow-hidden rounded-[var(--radius)] border border-line">
      <div className="relative aspect-[16/8] overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]">
          <ProjectMedia item={item} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="p-6 md:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight">{t(item.name)}</h3>
          <div className="flex shrink-0 gap-2">
            {item.links.demo && (
              <a
                href={item.links.demo}
                target="_blank"
                rel="noreferrer"
                aria-label="Demo"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-all duration-300 hover:border-transparent hover:text-white"
                style={{}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon name="external" size={14} />
              </a>
            )}
            {item.links.github && (
              <a
                href={item.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-all duration-300 hover:border-transparent hover:text-white"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon name="github" size={14} />
              </a>
            )}
          </div>
        </div>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{t(item.description)}</p>
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag, j) => (
              <span
                key={j}
                className="rounded-full px-3 py-1 text-[12px] font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                  color: 'color-mix(in srgb, var(--accent) 80%, var(--fg))',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </TiltCard>
  )
}

export function Projects() {
  const { site, t } = useSite()
  if (!site || !site.projects.enabled) return null
  const p = site.projects
  return (
    <Section id="projects">
      <SectionHeading eyebrow="Work" title={t(p.title)} />
      <div className="grid gap-6 md:grid-cols-2">
        {p.items.map((item, i) => (
          <Reveal
            key={i}
            delay={(i % 2) * 0.08}
            className={item.featured && i === 0 ? 'md:col-span-2' : ''}
          >
            <ProjectCard item={item} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
