import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { assistantApi } from '../lib/api'
import type { AssistantConfig, ChatMsg, PaletteOption } from '../lib/api'
import type { SiteData } from '../lib/types'
import { cn } from '../lib/utils'
import { Icon } from '../components/icons'
import { inputCls, Field, SectionCard } from './fields'
import { ASSISTANT_SUB_TABS } from './navigation'
import type { AssistantTabKey } from './navigation'

/* ================= 内置高级配色预设 ================= */
const PRESET_PALETTES: { name: string; mood: string; mode: 'dark' | 'light'; accent: string; accent2: string }[] = [
  { name: '极光蓝紫', mood: '科技 · 现代 · Apple 风', mode: 'dark', accent: '#0a84ff', accent2: '#bf5af2' },
  { name: '深空青绿', mood: '冷静 · 专业 · 数据感', mode: 'dark', accent: '#10b981', accent2: '#22d3ee' },
  { name: '午夜靛蓝', mood: '深邃 · 优雅 · 未来感', mode: 'dark', accent: '#6366f1', accent2: '#ec4899' },
  { name: '石墨霓虹', mood: '极客 · 高对比 · 夜行者', mode: 'dark', accent: '#38bdf8', accent2: '#34d399' },
  { name: '墨金商务', mood: '沉稳 · 高级 · 金融风', mode: 'dark', accent: '#e8b64c', accent2: '#8b5cf6' },
  { name: '香槟珊瑚', mood: '温暖 · 创业者 · 有态度', mode: 'dark', accent: '#f5a623', accent2: '#ff6b6b' },
  { name: '奶油墨绿', mood: '知性 · 温和 · 学术感', mode: 'light', accent: '#0f766e', accent2: '#f59e0b' },
  { name: '商务藏蓝', mood: '稳重 · 可信 · 企业风', mode: 'light', accent: '#1e40af', accent2: '#0ea5e9' },
  { name: '樱花紫粉', mood: '温柔 · 清新 · 个人品牌', mode: 'light', accent: '#db2777', accent2: '#8b5cf6' },
  { name: '陶土赤霞', mood: '艺术 · 创意 · 设计师', mode: 'light', accent: '#c2410c', accent2: '#be185d' },
  { name: '燕麦靛青', mood: '极简 · 北欧 · 产品人', mode: 'light', accent: '#0d9488', accent2: '#334155' },
  { name: '亚麻珊瑚紫', mood: '亲和 · 治愈 · 创作者', mode: 'light', accent: '#e11d48', accent2: '#7c3aed' },
]

const AI_PLACEHOLDER = '••••••'

/* ================= 模型设置 ================= */
function ModelSetup({
  cfg,
  onChange,
  showToast,
}: {
  cfg: AssistantConfig | null
  onChange: (c: AssistantConfig) => void
  showToast: (msg: string, type?: 'ok' | 'err') => void
}) {
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [busy, setBusy] = useState<'save' | 'test' | null>(null)

  useEffect(() => {
    if (!cfg) return
    setBaseUrl(cfg.baseUrl)
    setModel(cfg.model)
  }, [cfg])

  const save = async () => {
    if (!baseUrl.trim() || !model.trim()) return showToast('请填写 Base URL 和模型名', 'err')
    setBusy('save')
    try {
      const c = await assistantApi.saveConfig({
        baseUrl: baseUrl.trim(),
        model: model.trim(),
        apiKey: apiKey.trim() || AI_PLACEHOLDER,
      })
      setApiKey('')
      onChange(c)
      showToast('模型设置已保存 ✓')
    } catch (e: any) {
      showToast(e?.message || '保存失败', 'err')
    } finally {
      setBusy(null)
    }
  }

  const test = async () => {
    if (!cfg?.configured) return showToast('请先保存模型设置', 'err')
    setBusy('test')
    try {
      const r = await assistantApi.test()
      showToast('连接正常 ✓ 模型回复：' + r.reply)
    } catch (e: any) {
      showToast(e?.message || '连接失败', 'err')
    } finally {
      setBusy(null)
    }
  }

  return (
    <SectionCard
      title="模型设置（使用你自己的模型）"
      desc={
        cfg?.configured
          ? '已配置 ' + cfg.model + ' · ' + cfg.baseUrl
          : '首次使用请先填写：智能助手调用你自备的 OpenAI 兼容 API，密钥只保存在你自己服务器的 data/assistant.json'
      }
    >
      <div className="space-y-3">
        {!cfg?.configured && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
            <Icon name="key" size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <div className="text-[12.5px] leading-relaxed text-amber-200/90">
              <p className="font-semibold text-amber-300">还没有配置模型</p>
              <p className="mt-0.5">
                支持任何 OpenAI 兼容接口（OpenAI / DeepSeek / Kimi / 通义千问 / 智谱 GLM / 本地 Ollama 等）。
                填写下方三项后即可使用简历解析、AI 配色与智能问答。
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="API Base URL" hint="如 https://api.openai.com/v1 或 https://api.deepseek.com">
            <input className={inputCls} value={baseUrl} placeholder="https://api.xxx.com/v1" onChange={(e) => setBaseUrl(e.target.value)} />
          </Field>
          <Field label="模型名称" hint="如 gpt-4o-mini / deepseek-chat / glm-4-flash">
            <input className={inputCls} value={model} placeholder="模型名" onChange={(e) => setModel(e.target.value)} />
          </Field>
        </div>
        <Field label="API Key" hint={cfg?.keyMasked ? '当前已配置 ' + cfg.keyMasked + '，留空表示不修改' : '仅保存在你的服务器，不会发给第三方'}>
          <div className="flex gap-2">
            <input
              type="password"
              className={cn(inputCls, 'flex-1')}
              value={apiKey}
              placeholder={cfg?.keyMasked ? '••••••••（已配置，输入新 Key 可更换）' : 'sk-...'}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              onClick={test}
              disabled={busy !== null || !cfg?.configured}
              className="shrink-0 rounded-xl border border-line bg-surface-soft px-4 text-[13px] font-semibold text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
            >
              {busy === 'test' ? '测试中…' : '测试连接'}
            </button>
          </div>
        </Field>
        <button
          type="button"
          onClick={save}
          disabled={busy !== null}
          className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13.5px] font-semibold text-surface transition-all hover:opacity-85 disabled:opacity-50"
        >
          <Icon name={busy === 'save' ? 'reset' : 'save'} size={14} className={busy === 'save' ? 'animate-spin' : ''} />
          {busy === 'save' ? '保存中…' : '保存模型设置'}
        </button>
      </div>
    </SectionCard>
  )
}

/* ================= 配色预览条 ================= */
function PaletteCard({
  p,
  onApply,
  selected,
  onSelect,
}: {
  p: { name: string; mood: string; mode: string; accent: string; accent2: string; description?: string }
  onApply: (p: { mode: string; accent: string; accent2: string }) => void
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-2xl border bg-card transition-all',
        selected ? 'border-accent/70 shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--accent)_50%,transparent)]' : 'border-line hover:border-accent/40',
      )}
    >
      <div
        className="relative h-20"
        style={{ background: 'linear-gradient(120deg, ' + p.accent + ' 0%, ' + p.accent2 + ' 100%)' }}
      >
        <span className="absolute right-2 top-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {p.mode}
        </span>
        <span className="absolute bottom-2 left-3 font-mono text-[10.5px] font-semibold text-white/90 drop-shadow">
          {p.accent} · {p.accent2}
        </span>
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13.5px] font-bold text-ink">{p.name}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onApply(p)
            }}
            className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11.5px] font-semibold text-surface opacity-90 transition-all hover:opacity-100 group-hover:opacity-100 md:opacity-0"
          >
            <Icon name="check" size={11} /> 应用
          </button>
        </div>
        <p className="mt-1 text-[12px] text-muted">{p.mood}</p>
        {p.description && <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">{p.description}</p>}
      </div>
    </div>
  )
}

/* ================= 配色助手 ================= */
function PaletteTab({ draft, onApply, showToast }: { draft: SiteData; onApply: (t: { mode: string; accent: string; accent2: string }) => void; showToast: (m: string, t?: 'ok' | 'err') => void }) {
  const [aiPrompt, setAiPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiPalettes, setAiPalettes] = useState<PaletteOption[]>([])

  const gen = async () => {
    setBusy(true)
    try {
      const ctx = (draft.hero.name.zh || draft.hero.name.en || '') + ' · ' + (draft.hero.headline.zh || draft.hero.headline.en || '')
      const r = await assistantApi.palette(aiPrompt.trim(), ctx)
      setAiPalettes(r.palettes)
      if (!r.palettes.length) showToast('未生成有效配色，请重试', 'err')
    } catch (e: any) {
      showToast(e?.message || '生成失败', 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <SectionCard title="AI 智能配色" desc="描述你的行业 / 想要的感觉，让 AI 为你生成 3 套高级配色（需要已配置模型）">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={cn(inputCls, 'flex-1')}
            value={aiPrompt}
            placeholder="如：沉稳高端的金融风 / 温暖治愈的创作者主页 / 现代极客科技感…（留空则由 AI 自由发挥）"
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && gen()}
          />
          <button
            type="button"
            onClick={gen}
            disabled={busy}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
          >
            <Icon name={busy ? 'reset' : 'sparkles'} size={14} className={busy ? 'animate-spin' : ''} />
            {busy ? '生成中…' : 'AI 生成配色'}
          </button>
        </div>
        {aiPalettes.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aiPalettes.map((p, i) => (
              <PaletteCard key={i} p={p} onApply={onApply} />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="精选配色预设" desc="设计师精选的 12 套高级配色，无需模型即可一键应用">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_PALETTES.map((p) => (
            <PaletteCard key={p.name} p={p} onApply={onApply} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="配色小课堂" desc="为什么你配的颜色显「low」？几个立即见效的原则">
        <div className="space-y-2.5 text-[13px] leading-relaxed text-muted">
          <p><span className="font-semibold text-ink">① 60-30-10 法则：</span>60% 背景、30% 文字与卡片、10% 强调色。全站只让主色/辅色“出场”，其余克制，立刻显高级。</p>
          <p><span className="font-semibold text-ink">② 主色辅色怎么搭：</span>同色系（蓝+青）、经典互补（蓝+橙）、或「深色底 + 金属点缀」最稳；避免两个饱和度都很高的颜色撞在一起。</p>
          <p><span className="font-semibold text-ink">③ 深色模式：</span>别用纯黑背景 + 高饱和文字，用 #0a0a0c 这类带一点点灰的底色，文字用近白（#f5f5f7），观感柔和高级。</p>
          <p><span className="font-semibold text-ink">④ 浅色模式：</span>别用纯白 + 浅灰文字（对比度不足）。背景用 #fbfbfd 这类暖白，正文用近黑 #1d1d1f。</p>
          <p><span className="font-semibold text-ink">⑤ 圆角也很关键：</span>大圆角（24px）+ 柔和阴影 = Apple 风；小圆角（8px）= 硬核工程风。与配色一起决定气质。</p>
          <p><span className="font-semibold text-ink">⑥ 拿不准就交给 AI：</span>在上方描述你的职业与感觉，让模型出 3 套方案再挑。</p>
        </div>
      </SectionCard>
    </div>
  )
}

/* ================= 简历导入 ================= */
function ResumeTab({
  draft,
  onApply,
  showToast,
  configured,
}: {
  draft: SiteData
  onApply: (site: SiteData) => void
  showToast: (m: string, t?: 'ok' | 'err') => void
  configured: boolean
}) {
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('')
  const [busy, setBusy] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ site: SiteData; summary: string; warnings: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const pick = async (file?: File) => {
    if (!file) return
    setExtracting(true)
    setError('')
    try {
      const r = await assistantApi.extractResume(file)
      setText(r.text)
      setFilename(r.filename)
      setResult(null)
      showToast('已提取简历文本，可检查后解析')
    } catch (e: any) {
      setError(e?.message || '提取失败')
      showToast(e?.message || '提取失败', 'err')
    } finally {
      setExtracting(false)
    }
  }

  const parse = async () => {
    if (!text.trim()) return showToast('请先上传文件或粘贴简历内容', 'err')
    setBusy(true)
    setError('')
    try {
      const r = await assistantApi.parseResume(text)
      setResult(r)
      showToast('解析完成，请预览后应用 ✓')
    } catch (e: any) {
      setError(e?.message || '解析失败')
      showToast(e?.message || '解析失败', 'err')
    } finally {
      setBusy(false)
    }
  }

  const apply = () => {
    if (!result) return
    if (!window.confirm('将用解析结果覆盖当前未保存的配置（之后仍可在左侧各版块继续微调）。确定应用吗？')) return
    onApply(result.site)
    setResult(null)
    showToast('已应用解析结果，可继续微调后保存 ✓')
  }

  const count = result?.site
  return (
    <div className="space-y-5">
      {!configured && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-200/90">
          使用简历解析前，请先在上方「模型设置」中配置你自己的模型。
        </div>
      )}

      <SectionCard title="1 · 上传或粘贴简历" desc="支持 txt / md / pdf / docx，最大 10MB；也可直接粘贴纯文本">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            pick(e.dataTransfer.files?.[0])
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-7 text-center transition-colors',
            dragging ? 'border-accent/70 bg-accent/5' : 'border-line hover:border-accent/50',
          )}
        >
          {extracting ? (
            <>
              <Icon name="reset" size={22} className="animate-spin text-accent" />
              <span className="text-[13px] text-muted">正在提取文件文本…</span>
            </>
          ) : (
            <>
              <Icon name="upload" size={22} className="text-muted" />
              <span className="text-[13px] font-medium text-ink">点击选择文件，或拖拽到此处</span>
              <span className="text-[11.5px] text-faint">.txt · .md · .pdf · .docx（文件在服务器解析，内容不会外传）</span>
              {filename && <span className="text-[11.5px] text-accent">已读取：{filename}</span>}
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.pdf,.docx,.text"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <textarea
          className={cn(inputCls, 'h-40 resize-y font-mono text-[12px] leading-relaxed')}
          value={text}
          placeholder="也可以直接把简历内容粘贴到这里…"
          onChange={(e) => {
            setText(e.target.value)
            setFilename('')
            setResult(null)
          }}
        />
        {error && <p className="text-[12.5px] text-red-400">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={parse}
            disabled={busy || !configured || !text.trim()}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
            style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
          >
            <Icon name={busy ? 'reset' : 'sparkles'} size={14} className={busy ? 'animate-spin' : ''} />
            {busy ? '正在解析…（推理模型可能需要 1 分钟）' : '开始解析简历'}
          </button>
          <span className="text-[11.5px] text-faint">解析会调用你的模型生成完整站点配置</span>
        </div>
      </SectionCard>

      {result && count && (
        <SectionCard title="2 · 解析结果预览" desc="确认无误后一键应用到站点配置，再逐版块微调">
          {result.summary && (
            <p className="rounded-xl border border-line bg-surface-soft/60 px-4 py-3 text-[13px] leading-relaxed text-muted">
              {result.summary}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <PreviewCell label="姓名" value={count.hero.name.zh || count.hero.name.en} />
            <PreviewCell label="职位标题" value={count.hero.headline.zh || count.hero.headline.en} />
            <PreviewCell label="工作经历" value={count.experience.items.length + ' 条'} />
            <PreviewCell label="教育背景" value={count.education.items.length + ' 条'} />
            <PreviewCell label="技能分组" value={count.skills.groups.length + ' 组'} />
            <PreviewCell label="精选项目" value={count.projects.items.length + ' 个'} />
            <PreviewCell label="邮箱" value={count.contact.email || '未识别'} />
            <PreviewCell label="社交链接" value={count.contact.socials.length + ' 个'} />
            <PreviewCell label="推荐配色" value={count.theme.accent + ' / ' + count.theme.accent2} />
          </div>
          {result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
              <p className="mb-1.5 text-[12.5px] font-semibold text-amber-300">建议补充：</p>
              <ul className="list-inside list-disc space-y-1 text-[12.5px] text-amber-200/85">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={apply}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
            >
              <Icon name="check" size={14} /> 应用此配置（覆盖当前草稿）
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-[13px] font-semibold text-muted transition-colors hover:text-ink"
            >
              返回修改文本
            </button>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function PreviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft/50 px-3 py-2.5">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-faint">{label}</p>
      <p className="mt-0.5 truncate text-[12.5px] font-medium text-ink" title={value}>
        {value || '—'}
      </p>
    </div>
  )
}

/* ================= AI 问答 ================= */
function ChatTab({ draft, configured }: { draft: SiteData; configured: boolean }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'assistant', content: '你好！我是你的配置助手 👋 我可以教你使用这套后台：比如「怎么让首屏更高级？」、「主色辅色怎么选？」、「如何部署上线？」，也可以根据你当前的配置给建议。想问什么？' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = boxRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, busy])

  const buildSummary = (d: SiteData) => {
    return [
      '- 姓名: ' + (d.hero.name.zh || d.hero.name.en),
      '- 标题: ' + (d.hero.headline.zh || d.hero.headline.en),
      '- 明暗模式: ' + d.theme.mode + ', 主色 ' + d.theme.accent + ', 辅色 ' + d.theme.accent2,
      '- 版块: ' + d.layout.sections.join(', '),
      '- 工作经历 ' + d.experience.items.length + ' 条, 教育 ' + d.education.items.length + ' 条, 技能组 ' + d.skills.groups.length + ' 个, 项目 ' + d.projects.items.length + ' 个',
      '- 联系方式: ' + (d.contact.email || '未填') + ' / ' + (d.contact.phone || '未填'),
    ].join('\n')
  }

  const send = async () => {
    const q = input.trim()
    if (!q || busy) return
    const next: ChatMsg[] = [...msgs, { role: 'user', content: q }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      const r = await assistantApi.chat(next, buildSummary(draft))
      setMsgs([...next, { role: 'assistant', content: r.reply }])
    } catch (e: any) {
      setMsgs([...next, { role: 'assistant', content: '出错了：' + (e?.message || '未知错误') }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionCard title="AI 问答" desc="结合你当前的站点配置，教你用好这套系统（需要已配置模型）">
      {!configured && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-200/90">
          请先在上方「模型设置」中配置模型，才能开始问答。
        </div>
      )}
      <div ref={boxRef} className="flex h-96 flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-surface-soft/40 p-4">
        {msgs.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                m.role === 'user'
                  ? 'rounded-br-md text-white'
                  : 'rounded-bl-md border border-line bg-card text-ink',
              )}
              style={m.role === 'user' ? { background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' } : undefined}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-card px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          className={cn(inputCls, 'flex-1')}
          value={input}
          placeholder="问我任何关于配置的问题…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={!configured}
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !configured || !input.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
        >
          <Icon name="send" size={14} /> 发送
        </button>
      </div>
    </SectionCard>
  )
}

/* ================= 主组件 ================= */
export default function Assistant({
  draft,
  onApply,
  showToast,
}: {
  draft: SiteData
  onApply: (site: SiteData) => void
  showToast: (msg: string, type?: 'ok' | 'err') => void
}) {
  const [cfg, setCfg] = useState<AssistantConfig | null>(null)
  const [tab, setTab] = useState<AssistantTabKey>('resume')

  useEffect(() => {
    assistantApi.getConfig().then(setCfg).catch(() => {})
  }, [])

  const applyTheme = (t: { mode: string; accent: string; accent2: string }) => {
    onApply({
      ...draft,
      theme: { ...draft.theme, mode: t.mode as SiteData['theme']['mode'], accent: t.accent, accent2: t.accent2 },
    })
    showToast('配色已应用，保存后生效 ✓')
  }

  return (
    <div className="space-y-5">
      <ModelSetup cfg={cfg} onChange={setCfg} showToast={showToast} />

      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-line bg-card p-1">
        {ASSISTANT_SUB_TABS.map((st) => (
          <button
            key={st.key}
            onClick={() => setTab(st.key)}
            className={cn(
              'relative flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors',
              tab === st.key ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {tab === st.key && (
              <motion.span
                layoutId="assistant-subtab"
                className="absolute inset-0 rounded-xl border border-line bg-surface-soft"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon name={st.icon} size={15} className="relative" />
            <span className="relative">{st.label}</span>
          </button>
        ))}
      </div>

      {tab === 'resume' && <ResumeTab draft={draft} onApply={onApply} showToast={showToast} configured={Boolean(cfg?.configured)} />}
      {tab === 'palette' && <PaletteTab draft={draft} onApply={applyTheme} showToast={showToast} />}
      {tab === 'chat' && <ChatTab draft={draft} configured={Boolean(cfg?.configured)} />}
    </div>
  )
}
