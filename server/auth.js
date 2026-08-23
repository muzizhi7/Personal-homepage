// 认证：scrypt 密码哈希 + HMAC 签名会话 Cookie + 登录限流
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { DATA_DIR } from './store.js'

const AUTH_FILE = path.join(DATA_DIR, 'auth.json')
const SECRET_FILE = path.join(DATA_DIR, 'secret')
const INITIAL_PW_FILE = path.join(DATA_DIR, 'INITIAL_PASSWORD.txt')
export const COOKIE = 'ph_auth'
const SESSION_MS = 30 * 24 * 3600 * 1000 // 30 天
const MAX_ATTEMPTS = 8
const LOCK_MS = 10 * 60 * 1000

let secret = ''
function getSecret() {
  if (secret) return secret
  if (fs.existsSync(SECRET_FILE)) {
    secret = fs.readFileSync(SECRET_FILE, 'utf8').trim()
  } else {
    secret = crypto.randomBytes(32).toString('hex')
    fs.writeFileSync(SECRET_FILE, secret)
  }
  return secret
}

const hashPw = (pw, salt) => crypto.scryptSync(String(pw ?? ''), salt, 64).toString('hex')

export function ensureAuth() {
  if (fs.existsSync(AUTH_FILE)) return
  const salt = crypto.randomBytes(16).toString('hex')
  const pw = 'pw-' + crypto.randomBytes(5).toString('hex')
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ salt, hash: hashPw(pw, salt), updatedAt: Date.now() }))
  fs.writeFileSync(INITIAL_PW_FILE, pw + '\n')
  console.log('')
  console.log('==================================================')
  console.log('  首次启动：已为你生成后台管理初始密码')
  console.log('  管理后台: http://localhost:8787/admin')
  console.log('  密码    : ' + pw)
  console.log('  已保存至: data/INITIAL_PASSWORD.txt')
  console.log('  登录后请尽快在「账号设置」中修改密码')
  console.log('==================================================')
  console.log('')
}

export function verifyPassword(pw) {
  try {
    const a = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'))
    const h = Buffer.from(hashPw(pw, a.salt), 'hex')
    const expected = Buffer.from(a.hash, 'hex')
    return h.length === expected.length && crypto.timingSafeEqual(h, expected)
  } catch {
    return false
  }
}

export function changePassword(oldPw, newPw) {
  if (!verifyPassword(oldPw)) return { ok: false, error: '当前密码不正确' }
  if (typeof newPw !== 'string' || newPw.length < 8) return { ok: false, error: '新密码至少 8 位' }
  const salt = crypto.randomBytes(16).toString('hex')
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ salt, hash: hashPw(newPw, salt), updatedAt: Date.now() }))
  if (fs.existsSync(INITIAL_PW_FILE)) fs.unlinkSync(INITIAL_PW_FILE)
  return { ok: true }
}

export function getInitialPassword() {
  if (!fs.existsSync(INITIAL_PW_FILE)) return null
  return fs.readFileSync(INITIAL_PW_FILE, 'utf8').trim()
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
  return body + '.' + sig
}

function verifyToken(token) {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (p.exp && Date.now() < p.exp) return p
  } catch {
    /* ignore */
  }
  return null
}

export function createSession() {
  return sign({ iat: Date.now(), exp: Date.now() + SESSION_MS })
}

export function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx > -1) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim()
  }
  return out
}

export function sessionFromRequest(req) {
  return verifyToken(parseCookies(req.headers.cookie)[COOKIE])
}

// 简单的 IP 级登录限流
const attempts = new Map()
export function checkLocked(ip) {
  const rec = attempts.get(ip)
  if (rec && rec.count >= MAX_ATTEMPTS && Date.now() < rec.until) return true
  return false
}
export function recordFailure(ip) {
  const rec = attempts.get(ip) || { count: 0, until: 0 }
  rec.count += 1
  if (rec.count >= MAX_ATTEMPTS) rec.until = Date.now() + LOCK_MS
  attempts.set(ip, rec)
}
export function clearAttempts(ip) {
  attempts.delete(ip)
}
