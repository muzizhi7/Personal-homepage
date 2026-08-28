import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { LanguageProvider } from './lib/i18n'
import { SiteProvider, useSite } from './lib/site'
import Home from './site/Home'
import LoadingScreen from './components/LoadingScreen'

const publicOnly = import.meta.env.VITE_PUBLIC_ONLY === '1'
const AdminApp = lazy(() => import('./admin/AdminApp'))

function ScrollManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09 })
    ;(window as any).__lenis = lenis
    return () => {
      lenis.destroy()
      delete (window as any).__lenis
    }
  }, [])
  return null
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <div className="text-4xl">😵</div>
      <p className="text-[15px] text-muted">无法加载站点配置：{message}</p>
      <p className="max-w-sm text-[12.5px] leading-relaxed text-faint">
        请确认服务端已启动（npm run dev / npm start），并检查 data/site.json 是否存在。
      </p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-full px-6 py-2.5 text-[13.5px] font-semibold text-white transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
      >
        重新加载
      </button>
    </div>
  )
}

function Shell() {
  const { site, error, reload } = useSite()
  if (!site && !error) return <LoadingScreen />
  if (!site && error) return <ErrorScreen message={error} onRetry={reload} />
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {!publicOnly && (
        <Route
          path="/admin"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminApp />
            </Suspense>
          }
        />
      )}
      {publicOnly && <Route path="/admin" element={<Navigate to="/" replace />} />}
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default function App() {
  return (
    <>
      <LenisProvider />
      <ScrollManager />
      <LanguageProvider defaultLang="zh">
        <SiteProvider>
          <Shell />
        </SiteProvider>
      </LanguageProvider>
    </>
  )
}
