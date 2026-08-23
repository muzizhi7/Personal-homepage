import assert from 'node:assert/strict'
import test from 'node:test'
import { ADMIN_NAV_GROUPS, ADMIN_TABS, ASSISTANT_SUB_TABS } from './navigation.ts'

test('groups admin navigation in the approved order', () => {
  assert.deepEqual(
    ADMIN_NAV_GROUPS.map((group) => group.label),
    ['站点', '内容管理', '工具与支持'],
  )
  assert.deepEqual(
    ADMIN_NAV_GROUPS.map((group) => group.items.map((item) => item.key)),
    [
      ['overview'],
      ['hero', 'about', 'stats', 'experience', 'education', 'skills', 'projects', 'contact'],
      ['assistant', 'guide', 'account'],
    ],
  )
  assert.deepEqual(
    ADMIN_TABS.map((item) => item.key),
    [
      'overview',
      'hero',
      'about',
      'stats',
      'experience',
      'education',
      'skills',
      'projects',
      'contact',
      'assistant',
      'guide',
      'account',
    ],
  )
})

test('keeps the usage guide out of assistant sub-tabs', () => {
  assert.deepEqual(
    ASSISTANT_SUB_TABS.map((item) => item.key),
    ['resume', 'palette', 'chat'],
  )
})
