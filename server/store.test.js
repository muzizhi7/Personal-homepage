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
      },
    },
  })

  assert.deepEqual(clean.contact.wechat, 'zhihao_wechat')
  assert.deepEqual(clean.contact.resume, {
    url: '/uploads/resume.pdf',
    label: { zh: '下载简历', en: 'Download Resume' },
  })
})
