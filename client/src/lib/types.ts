// 站点数据结构(与 server/seed.js 一致)
export type Lang = 'zh' | 'en'
export interface BText {
  zh: string
  en: string
}
export interface CTA {
  label: BText
  href: string
}
export interface Meta {
  title: BText
  description: BText
  keywords: string
  favicon: string
  defaultLang: Lang
}
export interface Theme {
  mode: 'auto' | 'light' | 'dark'
  accent: string
  accent2: string
  radius: number
  fontScale: number
  showGrain: boolean
  showAurora: boolean
}
export type SectionKey =
  | 'hero'
  | 'about'
  | 'stats'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'contact'
export interface Layout {
  sections: SectionKey[]
}
export interface Hero {
  enabled: boolean
  badge: BText
  name: BText
  headline: BText
  subheadline: BText
  avatar: string
  badges: BText[]
  ctaPrimary: CTA
  ctaSecondary: CTA
}
export interface About {
  enabled: boolean
  title: BText
  paragraphs: BText[]
  highlights: BText[]
  avatar: string
}
export interface StatsItem {
  value: string
  label: BText
}
export interface Stats {
  enabled: boolean
  title: BText
  items: StatsItem[]
}
export interface ExperienceItem {
  company: BText
  role: BText
  period: BText
  location: BText
  description: BText
  tags: string[]
  logo: string
  url: string
}
export interface Experience {
  enabled: boolean
  title: BText
  items: ExperienceItem[]
}
export interface EducationItem {
  school: BText
  degree: BText
  period: BText
  description: BText
}
export interface Education {
  enabled: boolean
  title: BText
  items: EducationItem[]
}
export interface SkillItem {
  name: string
  level: number
}
export interface SkillGroup {
  name: BText
  items: SkillItem[]
}
export interface Skills {
  enabled: boolean
  title: BText
  groups: SkillGroup[]
}
export interface ProjectItem {
  name: BText
  description: BText
  tags: string[]
  image: string
  links: { demo: string; github: string }
  featured: boolean
}
export interface Projects {
  enabled: boolean
  title: BText
  items: ProjectItem[]
}
export interface Social {
  platform: string
  url: string
  label: BText
}
export interface Contact {
  enabled: boolean
  title: BText
  subtitle: BText
  email: string
  phone: string
  location: BText
  cta: CTA
  socials: Social[]
}
export interface Footer {
  text: BText
  showSocials: boolean
}
export interface SiteData {
  version: number
  meta: Meta
  theme: Theme
  layout: Layout
  hero: Hero
  about: About
  stats: Stats
  experience: Experience
  education: Education
  skills: Skills
  projects: Projects
  contact: Contact
  footer: Footer
}

export const SECTION_LABELS: Record<SectionKey, BText> = {
  hero: { zh: '首屏', en: 'Hero' },
  about: { zh: '关于', en: 'About' },
  stats: { zh: '数据', en: 'Stats' },
  experience: { zh: '经历', en: 'Experience' },
  education: { zh: '教育', en: 'Education' },
  skills: { zh: '技能', en: 'Skills' },
  projects: { zh: '项目', en: 'Projects' },
  contact: { zh: '联系', en: 'Contact' },
}

export const PLATFORMS = ['github', 'x', 'weibo', 'bilibili', 'xiaohongshu', 'linkedin', 'mail', 'globe', 'rss'] as const
