import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveProfileAvatar } from './profile-avatar.ts'

test('uses the configured Hero avatar and localized-name fallback', () => {
  assert.deepEqual(resolveProfileAvatar('/uploads/me.jpg', '李智豪'), {
    src: '/uploads/me.jpg',
    initial: '李',
  })
  assert.deepEqual(resolveProfileAvatar('   ', 'Zhihao Li'), {
    src: null,
    initial: 'Z',
  })
  assert.deepEqual(resolveProfileAvatar('', ''), {
    src: null,
    initial: '?',
  })
})
