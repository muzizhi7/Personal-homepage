import assert from 'node:assert/strict'
import test from 'node:test'
import { sanitizeSite } from './store.js'

test('preserves WeChat contact and downloadable resume settings', () => {
  const clean = sanitizeSite({
    contact: {
      wechat: 'zhihao_wechat',
      resume: {
        url: '/uploads/resume.pdf',
        label: { zh: '下载简历', en: 'Download Resume' },
        notice: { zh: '旧版简历，最新经历请以主页为准。', en: 'Older resume; see the homepage for current experience.' },
      },
    },
  })

  assert.deepEqual(clean.contact.wechat, 'zhihao_wechat')
  assert.deepEqual(clean.contact.resume, {
    url: '/uploads/resume.pdf',
    label: { zh: '下载简历', en: 'Download Resume' },
    notice: { zh: '旧版简历，最新经历请以主页为准。', en: 'Older resume; see the homepage for current experience.' },
  })
})

test('keeps old configuration compatible with an empty resume notice', () => {
  const clean = sanitizeSite({ contact: { resume: { url: '/uploads/resume.pdf' } } })
  assert.deepEqual(clean.contact.resume.notice, { zh: '', en: '' })
})
