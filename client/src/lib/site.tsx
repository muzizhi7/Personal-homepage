import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from './api'
import { useLang } from './i18n'
import type { BText, SiteData } from './types'

interface SiteCtx {
  site: SiteData | null
  error: string | null
  reload: () => Promise<void>
  t: (b?: BText | null) => string
}
const Ctx = createContext<SiteCtx>({ site: null, error: null, reload: async () => {}, t: () => '' })

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { lang, setLang } = useLang()

  const reload = useCallback(async () => {
    try {
      setError(null)
      const data = await api.getSite()
      setSite(data)
    } catch (e: any) {
      setError(e?.message || '加载失败')
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // 应用主题
  useEffect(() => {
    if (!site) return
    // 用户未手动选择过语言时，跟随站点默认语言
    try {
      const chosen = localStorage.getItem('ph_lang')
      if (chosen !== 'zh' && chosen !== 'en') setLang(site.meta.defaultLang)
    } catch {
      /* ignore */
    }
    const t = site.theme
    const root = document.documentElement
    root.style.setProperty('--accent', t.accent)
    root.style.setProperty('--accent-2', t.accent2)
    root.style.setProperty('--radius', t.radius + 'px')
    root.style.fontSize = (16 * t.fontScale).toFixed(2) + 'px'
    const dark =
      t.mode === 'dark' || (t.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
    root.classList.toggle('grain', t.showGrain)

    document.title = site.meta.title[lang] || site.meta.title.zh || '个人主页'
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (desc) desc.content = site.meta.description[lang] || site.meta.description.zh || ''
    const fav = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (fav && site.meta.favicon) fav.href = site.meta.favicon
  }, [site, lang])

  const t = useCallback((b?: BText | null) => b?.[lang] || b?.zh || b?.en || '', [lang])

  const value = useMemo(() => ({ site, error, reload, t }), [site, error, reload, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSite() {
  return useContext(Ctx)
}
