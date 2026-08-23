// 个人主页服务：API + 静态托管 + 上传
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import multer from 'multer'
import crypto from 'node:crypto'
import {
  ROOT,
  DATA_DIR,
  UPLOADS_DIR,
  loadSite,
  saveSite,
  resetSite,
  sanitizeSite,
  ensureDirs,
} from './store.js'
import {
  getAssistantConfig,
  saveAssistantConfig,
  maskedConfig,
  testConnection,
  parseResume,
  generatePalettes,
  assistantChat,
  extractTextFromBuffer,
  RESUME_EXTENSIONS,
} from './assistant.js'
import {
  ensureAuth,
  verifyPassword,
  changePassword,
  getInitialPassword,
  createSession,
  sessionFromRequest,
  parseCookies,
  checkLocked,
  recordFailure,
  clearAttempts,
  COOKIE,
} from './auth.js'

const PORT = Number(process.env.PORT || 8787)
const app = express()

ensureDirs()
ensureAuth()

app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))

// ---------- 静态资源 ----------
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(ROOT, 'client', 'dist')
  if (fs.existsSync(dist)) {
    app.use(express.static(dist))
    // SPA 回退：非 API / uploads 的 GET 一律返回 index.html
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(dist, 'index.html'))
      } else {
        next()
      }
    })
  } else {
    console.warn('[server] 未找到 client/dist，请先运行: npm run build')
  }
}

// ---------- 工具 ----------
const requireAuth = (req, res, next) => {
  if (sessionFromRequest(req)) return next()
  res.status(401).json({ error: '未登录或会话已过期' })
}

const ok = (res, data = {}) => res.json({ ok: true, ...data })
const fail = (res, status, error) => res.status(status).json({ error })

// ---------- 公开 API ----------
app.get('/api/health', (_req, res) => ok(res, { time: Date.now() }))

app.get('/api/site', (_req, res) => {
  ok(res, { data: loadSite() })
})

// ---------- 认证 API ----------
app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || 'unknown'
  if (checkLocked(ip)) return fail(res, 429, '尝试次数过多，请 10 分钟后再试')
  if (verifyPassword(req.body?.password)) {
    clearAttempts(ip)
    res.setHeader(
      'Set-Cookie',
      `${COOKIE}=${createSession()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
    )
    return ok(res)
  }
  recordFailure(ip)
  fail(res, 401, '密码错误')
})

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  ok(res)
})

app.get('/api/auth/me', requireAuth, (_req, res) => ok(res))

// ---------- 管理 API ----------
app.get('/api/admin/initial-password', requireAuth, (_req, res) => {
  ok(res, { password: getInitialPassword() })
})

app.put('/api/admin/site', requireAuth, (req, res) => {
  const clean = sanitizeSite(req.body?.data ?? req.body)
  saveSite(clean)
  ok(res, { data: clean })
})

app.post('/api/admin/reset', requireAuth, (_req, res) => {
  const clean = sanitizeSite(resetSite())
  ok(res, { data: clean })
})

app.post('/api/admin/password', requireAuth, (req, res) => {
  const r = changePassword(req.body?.old, req.body?.new)
  if (!r.ok) return fail(res, 400, r.error)
  ok(res)
})

// 图片上传
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '')
      const safeExt = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'].includes(ext) ? ext : '.png'
      cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('仅支持图片文件'))
  },
})

app.post('/api/admin/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return fail(res, 400, '未收到文件')
  ok(res, { url: '/uploads/' + req.file.filename })
})


// 简历上传(内存模式, 支持 txt/md/pdf/docx)
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (RESUME_EXTENSIONS.includes(ext)) cb(null, true)
    else cb(new Error('仅支持 txt / md / pdf / docx 文件'))
  },
})

// ---------- 智能助手 API ----------
app.get('/api/admin/assistant', requireAuth, (_req, res) => {
  ok(res, { config: maskedConfig() })
})

app.put('/api/admin/assistant', requireAuth, (req, res) => {
  const cfg = saveAssistantConfig(req.body)
  ok(res, { config: maskedConfig() })
})

app.post('/api/admin/assistant/test', requireAuth, async (_req, res, next) => {
  try {
    const r = await testConnection()
    ok(res, r)
  } catch (e) {
    next(e)
  }
})

app.post('/api/admin/assistant/extract', requireAuth, resumeUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, '未收到文件')
    const ext = path.extname(req.file.originalname).toLowerCase()
    const text = await extractTextFromBuffer(req.file.buffer, ext)
    if (!text) return fail(res, 400, '未能从文件中提取出文本，请确认文件内容或改用直接粘贴文本')
    ok(res, { text: text.slice(0, 60000), filename: req.file.originalname })
  } catch (e) {
    next(e)
  }
})

app.post('/api/admin/assistant/parse-resume', requireAuth, async (req, res, next) => {
  try {
    const r = await parseResume(req.body?.text)
    ok(res, r)
  } catch (e) {
    next(e)
  }
})

app.post('/api/admin/assistant/palette', requireAuth, async (req, res, next) => {
  try {
    const palettes = await generatePalettes({
      prompt: req.body?.prompt,
      context: req.body?.context,
    })
    ok(res, { palettes })
  } catch (e) {
    next(e)
  }
})

app.post('/api/admin/assistant/chat', requireAuth, async (req, res, next) => {
  try {
    const reply = await assistantChat(req.body?.messages, req.body?.siteSummary)
    ok(res, { reply })
  } catch (e) {
    next(e)
  }
})

// 错误处理
app.use((err, _req, res, _next) => {
  console.error('[server] error:', err.message)
  res.status(500).json({ error: err.message || '服务器错误' })
})

app.listen(PORT, () => {
  console.log(`[server] 个人主页服务已启动`)
  console.log(`[server] 主页    : http://localhost:${PORT}`)
  console.log(`[server] 管理后台: http://localhost:${PORT}/admin`)
})
