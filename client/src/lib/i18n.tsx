import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from './types'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}
const Ctx = createContext<LangCtx>({ lang: 'zh', setLang: () => {} })

export function LanguageProvider({ defaultLang, children }: { defaultLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('ph_lang')
      if (saved === 'zh' || saved === 'en') return saved
    } catch {
      /* ignore */
    }
    return defaultLang
  })

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('ph_lang', l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang() {
  return useContext(Ctx)
}
