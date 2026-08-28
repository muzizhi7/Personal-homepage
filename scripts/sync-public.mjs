// 将本地后台数据同步为 Vercel 公开主页构建快照。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'data')
const PUBLIC_DIR = path.join(ROOT, 'client', 'public')
const PUBLIC_UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads')

const siteSrc = path.join(DATA_DIR, 'site.json')
if (!fs.existsSync(siteSrc)) {
  console.error('[sync-public] 未找到 data/site.json，无法同步主页配置')
  process.exit(1)
}

fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })
fs.copyFileSync(siteSrc, path.join(PUBLIC_DIR, 'site.json'))

for (const name of fs.readdirSync(PUBLIC_UPLOADS_DIR)) {
  fs.rmSync(path.join(PUBLIC_UPLOADS_DIR, name), { recursive: true, force: true })
}

const uploadsSrc = path.join(DATA_DIR, 'uploads')
let count = 0
if (fs.existsSync(uploadsSrc)) {
  for (const name of fs.readdirSync(uploadsSrc)) {
    const src = path.join(uploadsSrc, name)
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(PUBLIC_UPLOADS_DIR, name))
      count++
    }
  }
}

console.log('[sync-public] 已同步 site.json 和 ' + count + ' 个图片文件到 client/public')
