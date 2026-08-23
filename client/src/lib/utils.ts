export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

// 将 {year} 占位符替换为当前年份
export function withYear(text: string): string {
  return text.replace(/\{year\}/g, String(new Date().getFullYear()))
}

// 判断链接类型：锚点 / 邮件 / 电话 / 外部
export function hrefKind(href: string): 'anchor' | 'mailto' | 'tel' | 'external' {
  if (href.startsWith('#')) return 'anchor'
  if (href.startsWith('mailto:')) return 'mailto'
  if (href.startsWith('tel:')) return 'tel'
  return 'external'
}

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash)
  if (!el) return
  const lenis = (window as any).__lenis
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.2 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsText(file)
  })
}
