import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../lib/api'
import { useSite } from '../lib/site'
import type { SectionKey, SiteData } from '../lib/types'
import { SECTION_LABELS } from '../lib/types'
import { cn, downloadJSON, readFileAsText } from '../lib/utils'
import { Icon } from '../components/icons'
import { EASE } from '../components/ui'
import Login from './Login'
import Assistant from './Assistant'
import Guide from './Guide'
import { ADMIN_NAV_GROUPS, ADMIN_TABS } from './navigation'
import type { AdminTabKey } from './navigation'
import { ColorInput, Field, ImagePicker, LangInput, SectionCard, Select, Slider, TextInput, Toggle } from './fields'
import {
  AboutEditor,
  ContactEditor,
  EducationEditor,
  ExperienceEditor,
  HeroEditor,
  ProjectsEditor,
  SkillsEditor,
  StatsEditor,
} from './editors'

/* ================= 全局设置 ================= */
function OverviewEditor({
  d,
  setSection,
  move,
}: {
  d: SiteData
  setSection: <K extends keyof SiteData>(k: K, patch: Partial<SiteData[K]>) => void
  move: (i: number, dir: -1 | 1) => void
}) {
  const { t } = useSite()
  const m = d.meta
  const th = d.theme
  return (
    <>
      <SectionCard title="网站信息" desc="浏览器标题、SEO 描述与图标">
        <Field label="网站标题">
          <LangInput value={m.title} onChange={(title) => setSection('meta', { title })} />
        </Field>
        <Field label="网站描述（SEO）">
          <LangInput value={m.description} onChange={(description) => setSection('meta', { description })} multiline rows={2} />
        </Field>
        <Field label="关键词（逗号分隔）">
          <TextInput value={m.keywords} onChange={(keywords) => setSection('meta', { keywords })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="默认语言">
            <Select
              value={m.defaultLang}
              onChange={(defaultLang) => setSection('meta', { defaultLang: defaultLang as 'zh' | 'en' })}
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Field>
          <Field label="网站图标（Favicon）">
            <ImagePicker value={m.favicon} onChange={(favicon) => setSection('meta', { favicon })} cropPreset="square" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="外观主题" desc="整体风格：明暗模式、主色调、圆角与字号">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="明暗模式">
            <Select
              value={th.mode}
              onChange={(mode) => setSection('theme', { mode: mode as SiteData['theme']['mode'] })}
              options={[
                { value: 'dark', label: '深色（默认，Apple 风）' },
                { value: 'light', label: '浅色' },
                { value: 'auto', label: '跟随系统' },
              ]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="主色">
              <ColorInput value={th.accent} onChange={(accent) => setSection('theme', { accent })} />
            </Field>
            <Field label="辅色">
              <ColorInput value={th.accent2} onChange={(accent2) => setSection('theme', { accent2 })} />
            </Field>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="卡片圆角" hint="0–48px">
            <Slider value={th.radius} onChange={(radius) => setSection('theme', { radius })} max={48} suffix="px" />
          </Field>
          <Field label="全局字号缩放">
            <Slider value={th.fontScale} onChange={(fontScale) => setSection('theme', { fontScale })} min={0.8} max={1.4} step={0.05} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <Toggle checked={th.showGrain} onChange={(showGrain) => setSection('theme', { showGrain })} label="噪点颗粒质感" />
          <Toggle checked={th.showAurora} onChange={(showAurora) => setSection('theme', { showAurora })} label="极光动态背景" />
        </div>
      </SectionCard>

      <SectionCard title="版块顺序与开关" desc="拖动上下调整顺序，右侧开关控制显示">
        <div className="space-y-2">
          {d.layout.sections.map((k, i) => (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-line bg-surface-soft/50 px-3.5 py-2.5">
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex h-5 w-5 items-center justify-center rounded text-faint transition-colors hover:text-ink disabled:opacity-25"
                  aria-label="上移"
                >
                  <Icon name="arrow-up" size={12} />
                </button>
                <button
                  type="button"
                  disabled={i === d.layout.sections.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex h-5 w-5 items-center justify-center rounded text-faint transition-colors hover:text-ink disabled:opacity-25"
                  aria-label="下移"
                >
                  <Icon name="arrow-down" size={12} />
                </button>
              </div>
              <span className="flex-1 text-[13.5px] font-medium">
                {t(SECTION_LABELS[k as SectionKey])}
                <span className="ml-1.5 text-[11px] text-faint">({k})</span>
              </span>
              <Toggle
                checked={(d[k as SectionKey] as { enabled?: boolean }).enabled !== false}
                onChange={(v) => setSection(k as SectionKey, { enabled: v } as never)}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="页脚" desc="底部版权信息">
        <Field label="页脚文案" hint="{year} 会被替换为当前年份">
          <LangInput value={d.footer.text} onChange={(text) => setSection('footer', { text })} />
        </Field>
        <Toggle checked={d.footer.showSocials} onChange={(showSocials) => setSection('footer', { showSocials })} label="显示社交图标" />
      </SectionCard>
    </>
  )
}

/* ================= 账号与数据 ================= */
function AccountEditor({
  d,
  setDraft,
  setDirty,
  showToast,
}: {
  d: SiteData
  setDraft: (fn: SiteData | ((prev: SiteData) => SiteData)) => void
  setDirty: (v: boolean) => void
  showToast: (msg: string, type?: 'ok' | 'err') => void
}) {
  const { reload } = useSite()
  const [initPw, setInitPw] = useState<string | null>(null)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.getInitialPassword().then((r) => setInitPw(r.password)).catch(() => {})
  }, [])

  const changePw = async () => {
    if (newPw.length < 8) return showToast('新密码至少 8 位', 'err')
    if (newPw !== confirmPw) return showToast('两次输入的新密码不一致', 'err')
    setPwBusy(true)
    try {
      await api.changePassword(oldPw, newPw)
      setOldPw('')
      setNewPw('')
      setConfirmPw('')
      setInitPw(null)
      showToast('密码已修改 ✓')
    } catch (e: any) {
      showToast(e?.message || '修改失败', 'err')
    } finally {
      setPwBusy(false)
    }
  }

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const parsed = JSON.parse(text)
      const data = await api.saveSite(parsed)
      setDraft(data)
      setDirty(false)
      reload()
      showToast('配置导入成功 ✓')
    } catch (e: any) {
      showToast('导入失败：' + (e?.message || '文件格式错误'), 'err')
    }
  }

  const onReset = async () => {
    if (!window.confirm('确定恢复为默认示例内容吗？当前所有配置将被覆盖。')) return
    try {
      const data = await api.resetSite()
      setDraft(data)
      setDirty(false)
      reload()
      showToast('已恢复为示例内容')
    } catch (e: any) {
      showToast(e?.message || '操作失败', 'err')
    }
  }

  const inputCls =
    'w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/20'

  return (
    <>
      {initPw && (
        <SectionCard title="初始密码" desc="首次启动自动生成，修改密码后自动失效">
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
            <Icon name="key" size={18} className="shrink-0 text-amber-400" />
            <code className="flex-1 text-[15px] font-bold tracking-widest text-amber-300">{initPw}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(initPw).then(() => showToast('已复制到剪贴板'))}
              className="rounded-lg bg-amber-400/20 px-3 py-1.5 text-[12px] font-semibold text-amber-300 transition-colors hover:bg-amber-400/30"
            >
              复制
            </button>
          </div>
        </SectionCard>
      )}

      <SectionCard title="修改密码" desc="建议登录后立即修改">
        <div className="space-y-3">
          <Field label="当前密码">
            <input type="password" className={inputCls} value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="新密码" hint="至少 8 位">
              <input type="password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            </Field>
            <Field label="确认新密码">
              <input type="password" className={inputCls} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </Field>
          </div>
          <button
            type="button"
            onClick={changePw}
            disabled={pwBusy}
            className="rounded-xl bg-ink px-5 py-2.5 text-[13.5px] font-semibold text-surface transition-all hover:opacity-85 disabled:opacity-50"
          >
            {pwBusy ? '提交中…' : '修改密码'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="配置数据" desc="导出备份、导入恢复、一键重置">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadJSON('site-config.json', d)}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-[13px] font-semibold transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Icon name="download" size={15} /> 导出配置
          </button>
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-[13px] font-semibold transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Icon name="upload" size={15} /> 导入配置
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Icon name="reset" size={15} /> 恢复示例内容
          </button>
          <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-faint">
          配置保存在服务器 <code className="rounded bg-surface-soft px-1.5 py-0.5 font-mono text-[11px]">data/site.json</code>，
          图片上传至 <code className="rounded bg-surface-soft px-1.5 py-0.5 font-mono text-[11px]">data/uploads/</code>。备份这两个目录即可迁移。
        </p>
      </SectionCard>
    </>
  )
}

/* ================= 主框架 ================= */
export default function AdminApp() {
  const { reload } = useSite()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [draft, setDraft] = useState<SiteData | null>(null)
  const [tab, setTab] = useState<AdminTabKey>('overview')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const toastTimer = useRef<number>(0)

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await api.getSite()
      setDraft(data)
      setDirty(false)
    } catch (e: any) {
      showToast(e?.message || '加载失败', 'err')
    }
  }, [showToast])

  useEffect(() => {
    api.me().then(() => setAuthed(true)).catch(() => setAuthed(false))
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed, load])

  const update = useCallback((fn: SiteData | ((prev: SiteData) => SiteData)) => {
    setDraft((prev) => (typeof fn === 'function' ? (fn as (p: SiteData) => SiteData)(prev!) : fn))
    setDirty(true)
  }, [])

  const setSection = useCallback(
    <K extends keyof SiteData>(k: K, patch: Partial<SiteData[K]>) => {
      update((s) => ({ ...s, [k]: { ...(s[k] as object), ...(patch as object) } } as SiteData))
    },
    [update],
  )

  const moveSection = useCallback(
    (i: number, dir: -1 | 1) => {
      if (!draft) return
      const copy = [...draft.layout.sections]
      const j = i + dir
      if (j < 0 || j >= copy.length) return
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      update((s) => ({ ...s, layout: { ...s.layout, sections: copy } }))
    },
    [draft, update],
  )

  const applySite = useCallback(
    (site: SiteData) => {
      update(site)
      showToast('已应用，请检查后再保存')
    },
    [update, showToast],
  )

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const data = await api.saveSite(draft)
      setDraft(data)
      setDirty(false)
      reload()
      showToast('已保存，主页已更新 ✓')
    } catch (e: any) {
      showToast(e?.message || '保存失败', 'err')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await api.logout()
    setAuthed(false)
    setDraft(null)
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div
          className="h-9 w-9 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent))' }}
        />
      </div>
    )
  }

  if (!authed || !draft) {
    return <Login onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="mx-auto flex w-full max-w-[1440px]">
        {/* 侧边栏 */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line p-5 md:flex">
          <Link to="/" className="mb-6 flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[16px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              {(draft.hero.name.zh || '?').charAt(0).toUpperCase()}
            </span>
            <span className="text-[15px] font-bold tracking-tight">配置后台</span>
          </Link>
          <nav className="flex-1 overflow-y-auto no-scrollbar">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.key} className="mb-4 last:mb-0">
                <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase text-faint">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      className={cn(
                        'relative flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-colors',
                        tab === item.key ? 'text-ink' : 'text-muted hover:text-ink',
                      )}
                    >
                      {tab === item.key && (
                        <motion.span
                          layoutId="admin-tab"
                          className="absolute inset-0 rounded-xl border border-line bg-card-strong"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon name={item.icon} size={16} className="relative" />
                      <span className="relative">{item.label}</span>
                      {item.key === 'hero' && dirty && tab !== 'hero' && (
                        <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-4 space-y-1 border-t border-line pt-4">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-muted transition-colors hover:bg-card hover:text-ink"
            >
              <Icon name="external" size={16} /> 新窗口预览
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-muted transition-colors hover:bg-card hover:text-red-400"
            >
              <Icon name="logout" size={16} /> 退出登录
            </button>
          </div>
        </aside>

        {/* 主区域 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/80 px-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-bold tracking-tight md:hidden">配置后台</span>
              <AnimatePresence>
                {dirty && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="hidden items-center gap-1.5 text-[12.5px] font-medium text-amber-400 md:flex"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    有未保存的更改
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                target="_blank"
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-card hover:text-ink"
              >
                <Icon name="eye" size={14} /> 预览
              </Link>
              <button
                onClick={save}
                disabled={saving || !dirty}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all',
                  dirty ? 'shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--accent)_70%,transparent)] hover:-translate-y-0.5' : 'opacity-45',
                )}
                style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
              >
                <Icon name={saving ? 'reset' : 'save'} size={14} className={saving ? 'animate-spin' : ''} />
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </header>

          {/* 移动端标签 */}
          <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-4 py-2 md:hidden">
            {ADMIN_TABS.map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                  tab === tb.key ? 'bg-ink text-surface' : 'text-muted',
                )}
              >
                <Icon name={tb.icon} size={13} />
                {tb.label}
              </button>
            ))}
          </div>

          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-3xl space-y-5">
              {tab === 'overview' && <OverviewEditor d={draft} setSection={setSection} move={moveSection} />}
              {tab === 'hero' && <HeroEditor d={draft} setSection={setSection} />}
              {tab === 'about' && <AboutEditor d={draft} setSection={setSection} />}
              {tab === 'stats' && <StatsEditor d={draft} setSection={setSection} />}
              {tab === 'experience' && <ExperienceEditor d={draft} setSection={setSection} />}
              {tab === 'education' && <EducationEditor d={draft} setSection={setSection} />}
              {tab === 'skills' && <SkillsEditor d={draft} setSection={setSection} />}
              {tab === 'projects' && <ProjectsEditor d={draft} setSection={setSection} />}
              {tab === 'contact' && <ContactEditor d={draft} setSection={setSection} />}
              {tab === 'account' && (
                <AccountEditor d={draft} setDraft={update} setDirty={setDirty} showToast={showToast} />
              )}
              {tab === 'assistant' && <Assistant draft={draft} onApply={applySite} showToast={showToast} />}
              {tab === 'guide' && <Guide />}
            </div>
          </main>
        </div>
      </div>

      {/* 提示 */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={cn(
                'glass rounded-full border px-5 py-2.5 text-[13.5px] font-medium shadow-lg',
                toast.type === 'ok' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400',
              )}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
