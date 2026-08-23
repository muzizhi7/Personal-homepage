import type { SiteData } from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message || '请求失败')
    this.status = status
  }
}

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const res = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers as any) } })
  if (res.status === 401) throw new ApiError(401, '未登录或会话已过期')
  let data: any = null
  try {
    data = await res.json()
  } catch {
    /* ignore */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || `请求失败 (${res.status})`)
  return data as T
}

export const api = {
  getSite: async () => {
    try {
      const r = await req<{ data: SiteData }>('/api/site')
      return r.data
    } catch (e) {
      // 纯静态部署（Vercel 静态托管）时 /api 不可用，回退到构建时生成的 site.json
      const res = await fetch('/site.json')
      if (!res.ok) throw e
      return (await res.json()) as SiteData
    }
  },

  login: (password: string) =>
    req<{ ok: boolean }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => req<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => req<{ ok: boolean }>('/api/auth/me'),

  saveSite: (data: SiteData) =>
    req<{ data: SiteData }>('/api/admin/site', { method: 'PUT', body: JSON.stringify({ data }) }).then(
      (r) => r.data,
    ),
  resetSite: () =>
    req<{ data: SiteData }>('/api/admin/reset', { method: 'POST' }).then((r) => r.data),
  changePassword: (old: string, next: string) =>
    req<{ ok: boolean }>('/api/admin/password', {
      method: 'POST',
      body: JSON.stringify({ old, new: next }),
    }),
  getInitialPassword: () => req<{ password: string | null }>('/api/admin/initial-password'),

  upload: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return req<{ url: string }>('/api/admin/upload', { method: 'POST', body: fd }).then((r) => r.url)
  },
}

/* ================= 智能助手 ================= */
export interface AssistantConfig {
  baseUrl: string
  model: string
  configured: boolean
  keyMasked: string
}
export interface PaletteOption {
  name: string
  mood: string
  mode: 'dark' | 'light' | 'auto'
  accent: string
  accent2: string
  description: string
}
export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export const assistantApi = {
  getConfig: () => req<{ config: AssistantConfig }>('/api/admin/assistant').then((r) => r.config),
  saveConfig: (c: { baseUrl: string; apiKey: string; model: string }) =>
    req<{ config: AssistantConfig }>('/api/admin/assistant', { method: 'PUT', body: JSON.stringify(c) }).then((r) => r.config),
  test: () => req<{ ok: boolean; reply: string }>('/api/admin/assistant/test', { method: 'POST' }),
  extractResume: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return req<{ text: string; filename: string }>('/api/admin/assistant/extract', { method: 'POST', body: fd })
  },
  parseResume: (text: string) =>
    req<{ site: SiteData; summary: string; warnings: string[] }>('/api/admin/assistant/parse-resume', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  palette: (prompt: string, context: string) =>
    req<{ palettes: PaletteOption[] }>('/api/admin/assistant/palette', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    }),
  chat: (messages: ChatMsg[], siteSummary: string) =>
    req<{ reply: string }>('/api/admin/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, siteSummary }),
    }),
}
