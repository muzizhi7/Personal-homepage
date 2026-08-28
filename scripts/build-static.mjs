// 构建后把 data/site.json 和 data/uploads/ 复制到 client/dist，
// 使纯静态部署（Vercel 静态托管）下主页仍能正常展示。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'data')
const DIST_DIR = path.join(ROOT, 'client', 'dist')

if (!fs.existsSync(DIST_DIR)) {
  console.error('[build-static] client/dist 不存在，请先构建前端')
  process.exit(1)
}

// 1) site.json —— 主页数据
const siteSrc = path.join(DATA_DIR, 'site.json')
if (fs.existsSync(siteSrc)) {
  fs.copyFileSync(siteSrc, path.join(DIST_DIR, 'site.json'))
  console.log('[build-static] 已复制 data/site.json -> client/dist/site.json')
} else {
  if (fs.existsSync(path.join(DIST_DIR, 'site.json'))) {
    console.log('[build-static] 使用 client/public/site.json 作为静态主页快照')
  } else {
    console.warn('[build-static] 未找到 data/site.json 或 client/public/site.json，主页将显示加载失败')
  }
}

// 2) uploads —— 站内图片
const uploadsSrc = path.join(DATA_DIR, 'uploads')
const uploadsDest = path.join(DIST_DIR, 'uploads')
if (fs.existsSync(uploadsSrc)) {
  fs.mkdirSync(uploadsDest, { recursive: true })
  let count = 0
  for (const name of fs.readdirSync(uploadsSrc)) {
    const src = path.join(uploadsSrc, name)
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(uploadsDest, name))
      count++
    }
  }
  console.log('[build-static] 已复制 ' + count + ' 个文件 data/uploads -> client/dist/uploads')
} else if (fs.existsSync(uploadsDest)) {
  console.log('[build-static] 使用 client/public/uploads 作为静态图片快照')
}
