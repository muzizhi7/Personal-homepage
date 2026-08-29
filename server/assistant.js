// 智能助手：模型配置(自带 Key) + OpenAI 兼容 LLM 调用 + 简历解析/配色/问答
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, sanitizeSite } from './store.js'

const ASSISTANT_FILE = path.join(DATA_DIR, 'assistant.json')

/* ---------------- 模型配置存储 ---------------- */
export function getAssistantConfig() {
  try {
    if (fs.existsSync(ASSISTANT_FILE)) {
      const c = JSON.parse(fs.readFileSync(ASSISTANT_FILE, 'utf8'))
      return {
        baseUrl: typeof c.baseUrl === 'string' ? c.baseUrl : '',
        apiKey: typeof c.apiKey === 'string' ? c.apiKey : '',
        model: typeof c.model === 'string' ? c.model : '',
      }
    }
  } catch {
    /* ignore */
  }
  return { baseUrl: '', apiKey: '', model: '' }
}

export function saveAssistantConfig({ baseUrl, apiKey, model } = {}) {
  const prev = getAssistantConfig()
  const cfg = {
    baseUrl: String(baseUrl ?? '').trim().slice(0, 500),
    // 前端回传的掩码占位符表示“未修改”，保留旧 Key
    apiKey: String(apiKey ?? '').trim().slice(0, 500),
    model: String(model ?? '').trim().slice(0, 200),
  }
  if (cfg.apiKey === '••••••' || cfg.apiKey.startsWith('•••')) cfg.apiKey = prev.apiKey
  if (cfg.baseUrl && !cfg.model) cfg.model = prev.model
  fs.writeFileSync(ASSISTANT_FILE, JSON.stringify(cfg, null, 2))
  return cfg
}

export function isConfigured() {
  const c = getAssistantConfig()
  return Boolean(c.baseUrl && c.apiKey && c.model)
}

export function maskedConfig() {
  const c = getAssistantConfig()
  return {
    baseUrl: c.baseUrl,
    model: c.model,
    configured: Boolean(c.baseUrl && c.apiKey && c.model),
    keyMasked: c.apiKey ? '••••••' + c.apiKey.slice(-4) : '',
  }
}

/* ---------------- OpenAI 兼容 LLM 调用 ---------------- */
function normalizeEndpoint(baseUrl) {
  let b = String(baseUrl || '').trim().replace(/\/+$/, '')
  if (!b) return null
  if (/\/chat\/completions$/i.test(b)) return { endpoint: b, alt: b.replace(/\/v1\/chat\/completions$/i, '/chat/completions') }
  if (/\/v1$/i.test(b)) return { endpoint: b + '/chat/completions', alt: b.replace(/\/v1$/i, '') + '/chat/completions' }
  return { endpoint: b + '/v1/chat/completions', alt: b + '/chat/completions' }
}

async function request(endpoint, body) {
  const cfg = getAssistantConfig()
  let res
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cfg.apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    })
  } catch (e) {
    const msg = e?.name === 'TimeoutError' ? '请求超时(120s)，请检查模型地址或网络' : '网络请求失败: ' + (e?.message || e)
    throw new Error(msg)
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const detail = data?.error?.message || data?.error || data?.message || res.statusText
    throw new Error(`模型服务返回错误 (${res.status}): ${typeof detail === 'string' ? detail.slice(0, 300) : JSON.stringify(detail).slice(0, 300)}`)
  }
  return data
}

/**
 * 调用 OpenAI 兼容 /chat/completions
 * 自动降级: 400 时去掉 response_format; 404 时切换 /v1 前缀
 */
export async function llmChat({ system, user, json = false, maxTokens = 4000, temperature = 0.4 }) {
  const cfg = getAssistantConfig()
  if (!cfg.apiKey) throw new Error('尚未配置模型，请先在「智能助手 → 模型设置」中填写你的 API')
  const { endpoint, alt } = normalizeEndpoint(cfg.baseUrl) || {}
  if (!endpoint) throw new Error('模型地址(Base URL)无效')

  const buildBody = (withRf) => {
    const b = {
      model: cfg.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    }
    if (json && withRf) b.response_format = { type: 'json_object' }
    return b
  }

  // 候选顺序：主地址(+response_format) → 主地址(纯文本) → 备用地址(+response_format) → 备用地址(纯文本)
  // 任意网络错误 / 404 / 400 都会自动尝试下一个候选，兼容 DeepSeek 等对 /v1 路径断连的服务
  const candidates = []
  if (json) candidates.push({ ep: endpoint, withRf: true })
  candidates.push({ ep: endpoint, withRf: false })
  if (alt && alt !== endpoint) {
    if (json) candidates.push({ ep: alt, withRf: true })
    candidates.push({ ep: alt, withRf: false })
  }

  let lastErr = null
  for (const c of candidates) {
    try {
      const data = await request(c.ep, buildBody(c.withRf))
      return extractContent(data)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('模型调用失败')
}

function extractContent(data) {
  const msg = data?.choices?.[0]?.message || {}
  const content = msg.content
  if (typeof content === 'string' && content.trim()) return content
  const finish = data?.choices?.[0]?.finish_reason
  if (finish === 'length') {
    throw new Error('模型回复被截断（推理型模型会先消耗 token），可重试、增大 token 或换用非推理模型')
  }
  if (msg.reasoning_content) return String(msg.reasoning_content).slice(0, 500)
  throw new Error('模型未返回有效内容')
}

export function parseJsonLoose(text) {
  if (typeof text !== 'string') return null
  try {
    return JSON.parse(text)
  } catch {
    /* ignore */
  }
  const start = text.indexOf('{')
  if (start > -1) {
    const end = text.lastIndexOf('}')
    if (end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        /* ignore */
      }
    }
  }
  return null
}

/* ---------------- 提示词 ---------------- */
const SCHEMA_HINT = `站点配置结构(仅列出常用字段，缺省可为空，数组可为 []，布尔为 true/false):
{
  "meta": { "title": {"zh":"中文标题","en":"英文标题"}, "description": {"zh":"","en":""}, "keywords": "逗号分隔关键词", "defaultLang": "zh" },
  "theme": { "mode": "dark|light|auto", "accent": "#主色6位十六进制", "accent2": "#辅色6位十六进制", "radius": 24, "fontScale": 1, "showGrain": true, "showAurora": true },
  "layout": { "sections": ["hero","about","stats","experience","education","skills","projects","contact"] },
  "hero": { "enabled": true, "badge": {"zh":"","en":""}, "name": {"zh":"姓名","en":"英文名"}, "headline": {"zh":"","en":""}, "subheadline": {"zh":"","en":""}, "avatar": "", "badges": [{"zh":"标签","en":"Tag"}], "ctaPrimary": {"label":{"zh":"查看我的项目","en":"View my work"},"href":"#projects"}, "ctaSecondary": {"label":{"zh":"联系我","en":"Contact me"},"href":"#contact"} },
  "about": { "enabled": true, "title": {"zh":"关于我","en":"About Me"}, "paragraphs": [{"zh":"","en":""}], "highlights": [{"zh":"","en":""}], "avatar": "" },
  "stats": { "enabled": true, "title": {"zh":"一些数字","en":"By the numbers"}, "items": [{"value":"5+","label":{"zh":"","en":""}}] },
  "experience": { "enabled": true, "title": {"zh":"工作经历","en":"Experience"}, "items": [{"company":{"zh":"","en":""},"role":{"zh":"","en":""},"period":{"zh":"","en":""},"location":{"zh":"","en":""},"description":{"zh":"","en":""},"tags":[],"logo":"","url":""}] },
  "education": { "enabled": true, "title": {"zh":"教育背景","en":"Education"}, "items": [{"school":{"zh":"","en":""},"degree":{"zh":"","en":""},"period":{"zh":"","en":""},"description":{"zh":"","en":""}}] },
  "skills": { "enabled": true, "title": {"zh":"技能栈","en":"Skills"}, "groups": [{"name":{"zh":"","en":""},"items":[{"name":"技能名","level":85}]}] },
  "projects": { "enabled": true, "title": {"zh":"精选项目","en":"Featured Projects"}, "items": [{"name":{"zh":"","en":""},"description":{"zh":"","en":""},"tags":[],"image":"","links":{"demo":"","github":""},"featured":false}] },
  "contact": { "enabled": true, "title": {"zh":"联系我","en":"Contact"}, "subtitle": {"zh":"","en":""}, "email": "", "phone": "", "location": {"zh":"","en":""}, "cta": {"label":{"zh":"发邮件","en":"Email me"},"href":"mailto:"}, "socials": [{"platform":"github","url":"","label":{"zh":"GitHub","en":"GitHub"}}] },
  "footer": { "text": {"zh":"© {year} 姓名","en":"© {year} Name"}, "showSocials": true }
}`

export const PALETTE_SYSTEM = `你是一名资深网页视觉设计师，为个人主页推荐高级、可落地的配色方案。
只输出一个 JSON 对象，不要解释、Markdown 或代码块，格式必须是：
{"palettes":[{"name":"方案名称","mood":"气质描述","mode":"dark","accent":"#RRGGBB","accent2":"#RRGGBB","description":"使用建议"}]}
必须返回 3 套方案；mode 只能是 dark 或 light；accent 和 accent2 必须是 6 位十六进制颜色。
主色与辅色要有足够对比但避免刺眼撞色，结合用户职业和需求给出简洁、专业、适合网页界面的方案。`

export const CHAT_SYSTEM = `你是个人主页配置助手。请基于用户提供的当前站点配置回答问题，帮助用户修改文案、布局、配色和使用流程。
用简洁、明确、可执行的中文回答；不要编造配置中不存在的事实，不要输出 JSON，除非用户明确要求 JSON。`

// 简历解析采用「填空式模板」：模型只改值不改结构，对指令跟随弱的模型最可靠
const RESUME_SYSTEM = `你是资深简历解析专家与个人主页内容架构师。你的任务是把用户提供的简历文本，转成一份可直接用于「个人主页配置系统」的站点配置。

规则（必须严格遵守）：
1. 只输出一个 JSON 对象，不要任何解释文字、Markdown 或代码块标记。
2. site 的结构必须与用户消息中给出的 JSON 模板完全一致：你只能修改引号内的值、数字与数组内容，禁止增删字段、禁止自创字段名（如 name、job_intention、links 等都不允许出现）。
3. 双语字段 {zh,en}：zh 写简历原文（中文），en 写自然专业的英文翻译（不会可留空字符串）。
4. headline/subheadline 提炼得高级有品牌感；badges 取 4-8 个核心标签；highlights 取 4-6 个核心亮点。
5. stats 从简历事实推导（如 "5+"、项目数、播放量），value 用简洁形式。
6. theme 根据职业与气质推荐高级配色（mode 为 dark/light，accent/accent2 为 #RRGGBB，避免高饱和撞色）。
7. 只填写简历中真实存在的信息，禁止编造公司、项目、链接、邮箱；没有的信息用空字符串；数组按简历实际内容增减数量，简历中有的版块至少要填 1 项，不要留空数组（如 skills.groups 至少 2 组、hero.badges 至少 4 个、about.highlights 至少 4 个、contact.socials 至少 1 个）。
8. summary：2-3 句中文概述「提取了什么、填了哪些版块、有什么亮点」。warnings：列出简历缺失或值得补充的信息（可为空数组）。`

// 模板带示例条目：告诉模型数组里放什么形状的对象，避免留空
function resumeTemplate() {
  return {
    site: {
      version: 1,
      meta: { title: { zh: '', en: '' }, description: { zh: '', en: '' }, keywords: '', defaultLang: 'zh' },
      theme: { mode: 'dark', accent: '#4F8CF7', accent2: '#F5A623', radius: 20, fontScale: 1, showGrain: true, showAurora: true },
      layout: { sections: ['hero', 'about', 'stats', 'experience', 'education', 'skills', 'projects', 'contact'] },
      hero: {
        enabled: true,
        badge: { zh: '', en: '' },
        name: { zh: '', en: '' },
        headline: { zh: '', en: '' },
        subheadline: { zh: '', en: '' },
        avatar: '',
        badges: [{ zh: '核心标签1', en: 'Tag 1' }, { zh: '核心标签2', en: 'Tag 2' }],
        ctaPrimary: { label: { zh: '查看我的项目', en: 'View my work' }, href: '#projects' },
        ctaSecondary: { label: { zh: '联系我', en: 'Contact me' }, href: '#contact' },
      },
      about: {
        enabled: true,
        title: { zh: '关于我', en: 'About Me' },
        paragraphs: [{ zh: '第一段自我介绍（2-4段）', en: 'First intro paragraph' }],
        highlights: [{ zh: '亮点1', en: 'Highlight 1' }, { zh: '亮点2', en: 'Highlight 2' }],
        avatar: '',
      },
      stats: {
        enabled: true,
        title: { zh: '一些数字', en: 'By the numbers' },
        items: [{ value: '5+', label: { zh: '年经验', en: 'Years of experience' } }],
      },
      experience: {
        enabled: true,
        title: { zh: '工作经历', en: 'Experience' },
        items: [
          {
            company: { zh: '公司名', en: 'Company' },
            role: { zh: '职位', en: 'Role' },
            period: { zh: '2020 — 至今', en: '2020 — Present' },
            location: { zh: '城市', en: 'City' },
            description: { zh: '做了什么 + 结果（2-3句）', en: 'What you did + results (2-3 sentences)' },
            tags: ['技术栈', '关键词'],
            logo: '',
            url: '',
          },
        ],
      },
      education: {
        enabled: true,
        title: { zh: '教育背景', en: 'Education' },
        items: [{ school: { zh: '学校名', en: 'School' }, degree: { zh: '学位', en: 'Degree' }, period: { zh: '2015 — 2019', en: '2015 — 2019' }, description: { zh: '', en: '' } }],
      },
      skills: {
        enabled: true,
        title: { zh: '技能栈', en: 'Skills' },
        groups: [{ name: { zh: '前端', en: 'Frontend' }, items: [{ name: 'React', level: 90 }, { name: 'TypeScript', level: 85 }] }],
      },
      projects: {
        enabled: true,
        title: { zh: '精选项目', en: 'Featured Projects' },
        items: [
          {
            name: { zh: '项目名', en: 'Project name' },
            description: { zh: '项目描述（2-3句）', en: 'Project description' },
            tags: ['标签'],
            image: '',
            links: { demo: '', github: '' },
            featured: false,
          },
        ],
      },
      contact: {
        enabled: true,
        title: { zh: '联系我', en: 'Contact' },
        subtitle: { zh: '', en: '' },
        email: '',
        phone: '',
        location: { zh: '', en: '' },
        cta: { label: { zh: '发邮件', en: 'Email me' }, href: 'mailto:' },
        socials: [{ platform: 'github', url: '', label: { zh: 'GitHub', en: 'GitHub' } }],
      },
      footer: { text: { zh: '© {year} 姓名', en: '© {year} Name' }, showSocials: true },
    },
    summary: '',
    warnings: [],
  }
}

function isMeaningful(site) {
  const h = site?.hero || {}
  return Boolean(
    h?.name?.zh || h?.name?.en || h?.headline?.zh ||
    site?.experience?.items?.length ||
    site?.education?.items?.length ||
    site?.skills?.groups?.length ||
    site?.projects?.items?.length,
  )
}

export async function parseResume(text) {
  const raw = String(text || '').trim()
  if (!raw) throw new Error('简历内容为空')
  const template = JSON.stringify(resumeTemplate(), null, 1)
  const user = '【简历内容】\n' + raw.slice(0, 60000) + '\n\n【请严格填写这个 JSON 模板（只改引号内的值/数字/数组，保留全部字段和结构）】\n' + template

  let lastErr = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const instruction = attempt > 0
        ? '（第 ' + (attempt + 1) + ' 次尝试：上次输出不符合要求。再次强调：只能填写模板，不能改动结构、不能自创字段，直接输出完整 JSON）'
        : ''
      const content = await llmChat({ system: RESUME_SYSTEM, user: user + instruction, json: true, maxTokens: 8000, temperature: 0.2 })
      const obj = parseJsonLoose(content)
      const site = obj?.site ? sanitizeSite(obj.site) : null
      if (site && isMeaningful(site)) {
        return {
          site,
          summary: typeof obj.summary === 'string' ? obj.summary.slice(0, 500) : '',
          warnings: Array.isArray(obj.warnings) ? obj.warnings.map(String).slice(0, 8) : [],
        }
      }
      lastErr = new Error('模型返回的结构不符合要求（字段缺失或为空），请重试')
    } catch (e) {
      lastErr = e
    }
  }
  // LLM 多次失败 → 降级到规则解析，保证流程不中断
  const fb = fallbackParse(raw)
  if (fb) {
    fb.warnings.unshift('模型解析失败，已用规则自动提取基础信息，请在后台手动补充完整内容')
    return fb
  }
  throw lastErr || new Error('模型返回的不是有效 JSON，请换一个支持 JSON 输出的模型重试')
}

/* ---------------- 规则解析兜底 ---------------- */
function fallbackParse(text) {
  const s = String(text || '').replace(/\r/g, '')
  const g = (re, i = 1) => {
    const m = s.match(re)
    return m ? m[i].trim() : ''
  }
  const name = g(/姓名[:：]\s*(\S+)/) || g(/(\S{2,4})(?:先生|女士)?\s*[·•]\s*(?:前端|后端|产品|设计|工程)/) || s.split('\n')[0].trim().slice(0, 20)
  const email = g(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/)
  const phone = g(/(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})/)
  const gh = g(/github[.:/]+([\w.-]+)/i)
  const schools = [...new Set([...s.matchAll(/([\u4e00-\u9fa5]{2,}(?:大学|学院|学校))/g)].map((m) => m[1]))].slice(0, 3)
  const eduItems = schools.map((school) => ({
    school: { zh: school, en: '' },
    degree: { zh: '', en: '' },
    period: { zh: '', en: '' },
    description: { zh: '', en: '' },
  }))
  const skills = [...new Set([...s.matchAll(/(React|Vue|Angular|Node\.?js|TypeScript|JavaScript|Python|Go|Java|Docker|Kubernetes|Flutter|Swift|C\+\+|SQL|MySQL|PostgreSQL|Redis|Webpack|Vite|Next\.?js|GraphQL|AWS|Git|Figma|AI|机器学习|深度学习|大模型|数据分析|产品设计)/gi)].map((m) => m[1]))].slice(0, 12)
  const site = sanitizeSite({
    hero: {
      enabled: true,
      name: { zh: name, en: '' },
      headline: { zh: g(/(?:求职意向|目标岗位|意向)[:：]\s*(\S+)/) || '个人主页', en: '' },
      badges: skills.slice(0, 6).map((x) => ({ zh: x, en: '' })),
    },
    contact: { enabled: true, email, phone, socials: gh ? [{ platform: 'github', url: gh.startsWith('http') ? gh : 'https://github.com/' + gh, label: { zh: 'GitHub', en: 'GitHub' } }] : [] },
    education: { enabled: true, items: eduItems },
    skills: { enabled: true, groups: [{ name: { zh: '技能', en: 'Skills' }, items: skills.slice(0, 12).map((x) => ({ name: x, level: 70 })) }] },
  })
  if (!isMeaningful(site)) return null
  return {
    site,
    summary: '已用规则自动识别：姓名「' + name + '」、联系方式与技能标签，其余内容请在后台补充。',
    warnings: ['这是规则降级解析的结果（模型解析失败），版块内容不完整，请手动完善各版块', '建议检查模型配置，或换用指令跟随更强的模型（如 deepseek-chat）后重新解析'],
  }
}

/* ---------------- 连接测试 ---------------- */
export async function testConnection() {
  const cfg = getAssistantConfig()
  if (!cfg.apiKey) throw new Error('尚未配置模型，请先在「智能助手 → 模型设置」中填写你的 API')
  const { endpoint, alt } = normalizeEndpoint(cfg.baseUrl) || {}
  if (!endpoint) throw new Error('模型地址(Base URL)无效')
  const body = {
    model: cfg.model,
    messages: [{ role: 'user', content: '只回复两个字: 正常' }],
    temperature: 0,
    max_tokens: 64,
  }
  const errors = []
  for (const ep of [endpoint, alt]) {
    if (!ep) continue
    if (errors.some((e) => e.ep === ep)) continue
    try {
      const data = await request(ep, body)
      const msg = data?.choices?.[0]?.message || {}
      const reply = String(msg.content || msg.reasoning_content || '').slice(0, 80) || '(模型已响应，未返回文本——可能为推理型模型)'
      return { ok: true, reply, endpoint: ep }
    } catch (e) {
      errors.push({ ep, err: e })
    }
  }
  throw new Error(errors.map((x) => x.err.message).join('；'))
}

/* ---------------- AI 配色 ---------------- */
export async function generatePalettes({ prompt = '', context = '' } = {}) {
  const user = [
    prompt ? `我的需求: ${prompt}` : '没有特别偏好，请你自由发挥，但要契合我的职业。',
    context ? `我的职业/背景: ${context}` : '',
    '请给我 3 套高级配色方案。',
  ].filter(Boolean).join('\n')
  const hex = (v) => (/^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : '')
  // 推理型模型输出偶尔不稳定：最多重试 3 次，只要有 1 套有效配色即返回
  let lastErr = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const content = await llmChat({ system: PALETTE_SYSTEM, user, json: true, maxTokens: 2500, temperature: 0.6 })
      const obj = parseJsonLoose(content)
      const raw =
        (Array.isArray(obj?.palettes) && obj.palettes) ||
        (Array.isArray(obj?.data?.palettes) && obj.data.palettes) ||
        null
      const palettes = (raw || [])
        .filter((x) => hex(x.accent) && hex(x.accent2))
        .slice(0, 3)
        .map((x) => ({
          name: String(x.name || '配色方案').slice(0, 40),
          mood: String(x.mood || '').slice(0, 60),
          mode: x.mode === 'light' || x.mode === 'dark' ? x.mode : 'dark',
          accent: hex(x.accent),
          accent2: hex(x.accent2),
          description: String(x.description || '').slice(0, 300),
        }))
      if (palettes.length) return palettes
      lastErr = new Error('模型未返回有效配色，请重试')
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('模型返回格式不正确，请重试')
}

/* ---------------- 配置问答 ---------------- */
export async function assistantChat(messages, siteSummary) {
  const safe = Array.isArray(messages) ? messages.slice(-12) : []
  const user = [
    '【当前站点配置摘要】',
    siteSummary || '(空)',
    '',
    '【我的问题/需求】',
    safe.map((m) => (m.role === 'user' ? '用户: ' + String(m.content) : '助手: ' + String(m.content))).join('\n'),
  ].join('\n')
  const content = await llmChat({ system: CHAT_SYSTEM, user, json: false, maxTokens: 1000, temperature: 0.5 })
  return content.trim()
}

/* ---------------- 文档文本提取 ---------------- */
export async function extractTextFromBuffer(buf, ext) {
  const e = String(ext || '').toLowerCase()
  if (e === '.pdf') {
    const { extractText, getDocumentProxy } = await import('unpdf')
    const doc = await getDocumentProxy(new Uint8Array(buf))
    const res = await extractText(doc, { mergePages: true })
    return String(res.text || '').trim()
  }
  if (e === '.docx') {
    const mammoth = (await import('mammoth')).default
    const res = await mammoth.extractRawText({ buffer: buf })
    return String(res.value || '').trim()
  }
  // .txt / .md / 纯文本
  return String(buf.toString('utf8')).replace(/^\uFEFF/, '').trim()
}

export const RESUME_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.text']
