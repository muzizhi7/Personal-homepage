import assert from 'node:assert/strict'
import test from 'node:test'
import { CHAT_SYSTEM, PALETTE_SYSTEM } from './assistant.js'

test('defines dedicated system prompts for palette generation and assistant chat', () => {
  assert.match(PALETTE_SYSTEM, /palettes/)
  assert.match(PALETTE_SYSTEM, /#RRGGBB/)
  assert.match(CHAT_SYSTEM, /个人主页/)
})
