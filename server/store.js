// 简单的 JSON 文件存储：原子写入 + 内存缓存
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seed } from './seed.js'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DATA_DIR = path.join(ROOT, 'data')
export const SITE_FILE = path.join(DATA_DIR, 'site.json')
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

let cache = null

export function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export function loadSite() {
  if (cache) return cache
  ensureDirs()
  if (!fs.existsSync(SITE_FILE)) {
    cache = seed()
    saveSite(cache)
    console.log('[store] 已生成默认配置: data/site.json')
    return cache
  }
  try {
    cache = JSON.parse(fs.readFileSync(SITE_FILE, 'utf8'))
  } catch (e) {
    console.error('[store] 读取 site.json 失败，使用默认内容:', e.message)
    cache = seed()
  }
  return cache
}

export function saveSite(data) {
  ensureDirs()
  const tmp = SITE_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, SITE_FILE)
  cache = data
  return data
}

export function resetSite() {
  cache = seed()
  saveSite(cache)
  return cache
}

// ---------- 校验 / 清洗 ----------
const str = (v, max = 3000) => (typeof v === 'string' ? v.slice(0, max) : '')
const btext = (v) => ({ zh: str(v?.zh, 3000), en: str(v?.en, 3000) })
const bool = (v) => v === true
const num = (v, min = 0, max = Infinity) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min
}
const arr = (v) => (Array.isArray(v) ? v : [])
const pick = (v, shape) => {
  const out = {}
  for (const k of Object.keys(shape)) out[k] = shape[k](v?.[k])
  return out
}

const SECTIONS = ['hero', 'about', 'stats', 'experience', 'education', 'skills', 'projects', 'contact']

const ctaShape = {
  label: btext,
  href: (v) => str(v, 500),
}

const resumeShape = {
  url: (v) => str(v, 500),
  label: btext,
}

export function sanitizeSite(raw = {}) {
  return {
    version: 1,
    meta: pick(raw.meta, {
      title: btext,
      description: btext,
      keywords: (v) => str(v, 500),
      favicon: (v) => str(v, 500),
      defaultLang: (v) => (v === 'en' ? 'en' : 'zh'),
    }),
    theme: pick(raw.theme, {
      mode: (v) => (['auto', 'light', 'dark'].includes(v) ? v : 'dark'),
      accent: (v) => (/^#[0-9a-fA-F]{6}$/.test(str(v, 9)) ? v : '#0a84ff'),
      accent2: (v) => (/^#[0-9a-fA-F]{6}$/.test(str(v, 9)) ? v : '#bf5af2'),
      radius: (v) => num(v, 0, 48),
      fontScale: (v) => num(v, 0.8, 1.4),
      showGrain: bool,
      showAurora: bool,
    }),
    layout: pick(raw.layout, {
      sections: (v) => arr(v).filter((s) => SECTIONS.includes(s)).slice(0, 12),
    }),
    hero: pick(raw.hero, {
      enabled: bool,
      badge: btext,
      name: btext,
      headline: btext,
      subheadline: btext,
      avatar: (v) => str(v, 500),
      badges: (v) => arr(v).map(btext).filter((x) => x.zh || x.en).slice(0, 24),
      ctaPrimary: (v) => pick(v, ctaShape),
      ctaSecondary: (v) => pick(v, ctaShape),
    }),
    about: pick(raw.about, {
      enabled: bool,
      title: btext,
      paragraphs: (v) => arr(v).map(btext).slice(0, 8),
      highlights: (v) => arr(v).map(btext).filter((x) => x.zh || x.en).slice(0, 12),
      avatar: (v) => str(v, 500),
    }),
    stats: pick(raw.stats, {
      enabled: bool,
      title: btext,
      items: (v) =>
        arr(v)
          .map((i) => pick(i, { value: (x) => str(x, 20), label: btext }))
          .filter((i) => i.value)
          .slice(0, 8),
    }),
    experience: pick(raw.experience, {
      enabled: bool,
      title: btext,
      items: (v) =>
        arr(v)
          .map((i) =>
            pick(i, {
              company: btext,
              role: btext,
              period: btext,
              location: btext,
              description: btext,
              tags: (t) => arr(t).map((x) => str(x, 60)).filter(Boolean).slice(0, 12),
              logo: (x) => str(x, 500),
              url: (x) => str(x, 500),
            }),
          )
          .filter((i) => i.company.zh || i.company.en)
          .slice(0, 20),
    }),
    education: pick(raw.education, {
      enabled: bool,
      title: btext,
      items: (v) =>
        arr(v)
          .map((i) =>
            pick(i, {
              school: btext,
              degree: btext,
              period: btext,
              description: btext,
            }),
          )
          .filter((i) => i.school.zh || i.school.en)
          .slice(0, 20),
    }),
    skills: pick(raw.skills, {
      enabled: bool,
      title: btext,
      groups: (v) =>
        arr(v)
          .map((g) =>
            pick(g, {
              name: btext,
              items: (t) =>
                arr(t)
                  .map((i) => pick(i, { name: (x) => str(x, 60), level: (l) => num(l, 0, 100) }))
                  .filter((i) => i.name)
                  .slice(0, 30),
            }),
          )
          .filter((g) => g.items.length)
          .slice(0, 10),
    }),
    projects: pick(raw.projects, {
      enabled: bool,
      title: btext,
      items: (v) =>
        arr(v)
          .map((i) =>
            pick(i, {
              name: btext,
              description: btext,
              tags: (t) => arr(t).map((x) => str(x, 60)).filter(Boolean).slice(0, 12),
              image: (x) => str(x, 500),
              links: (l) => pick(l, { demo: (x) => str(x, 500), github: (x) => str(x, 500) }),
              featured: bool,
            }),
          )
          .filter((i) => i.name.zh || i.name.en)
          .slice(0, 24),
    }),
    contact: pick(raw.contact, {
      enabled: bool,
      title: btext,
      subtitle: btext,
      email: (v) => str(v, 200),
      phone: (v) => str(v, 60),
      wechat: (v) => str(v, 100),
      resume: (v) => pick(v, resumeShape),
      location: btext,
      cta: (v) => pick(v, ctaShape),
      socials: (v) =>
        arr(v)
          .map((s) => pick(s, { platform: (x) => str(x, 40), url: (x) => str(x, 500), label: btext }))
          .filter((s) => s.url)
          .slice(0, 16),
    }),
    footer: pick(raw.footer, {
      text: btext,
      showSocials: bool,
    }),
  }
}
