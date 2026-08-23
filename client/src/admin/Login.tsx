import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { Aurora, EASE } from '../components/ui'
import { Icon } from '../components/icons'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pw) return
    setBusy(true)
    setErr('')
    try {
      await api.login(pw)
      onSuccess()
    } catch (ex: any) {
      setErr(ex?.message || '登录失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <Aurora show />
      <motion.form
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: EASE }}
        onSubmit={submit}
        className="glass relative z-10 w-full max-w-sm rounded-[var(--radius)] border border-line p-8"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <span
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            <Icon name="settings" size={26} />
          </span>
          <h1 className="text-xl font-bold tracking-tight">管理后台</h1>
          <p className="mt-1 text-[13px] text-muted">登录以配置你的个人主页</p>
        </div>

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="请输入密码"
            autoFocus
            className="w-full rounded-xl border border-line bg-surface-soft px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-muted"
            aria-label="显示密码"
          >
            <Icon name={show ? 'eye-off' : 'eye'} size={17} />
          </button>
        </div>

        {err && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2.5 text-[12.5px] text-red-400">
            {err}
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-xl py-3 text-[14.5px] font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(105deg, var(--accent), var(--accent-2))' }}
        >
          {busy ? '验证中…' : '登 录'}
        </motion.button>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-faint">
          初始密码见服务端启动日志
          <br />
          或 data/INITIAL_PASSWORD.txt
        </p>
      </motion.form>
    </div>
  )
}
