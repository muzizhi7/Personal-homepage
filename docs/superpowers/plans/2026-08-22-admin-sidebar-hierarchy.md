# Admin Sidebar Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the admin sidebar into three clear sections and promote Usage guide from an assistant sub-tab to a first-class admin destination.

**Architecture:** A pure navigation module is the single source of truth for grouped desktop navigation, flattened mobile navigation, and assistant sub-tabs. `AdminApp` renders the grouped structure, while a dedicated `Guide` component owns the existing read-only guide content.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Node.js built-in test runner

---

### Task 1: Define Navigation Contracts With A Failing Test

**Files:**
- Create: `client/src/admin/navigation.test.ts`
- Create: `client/src/admin/navigation.ts`

- [ ] **Step 1: Write the failing navigation test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { ADMIN_NAV_GROUPS, ADMIN_TABS, ASSISTANT_SUB_TABS } from './navigation.ts'

test('groups admin navigation in the approved order', () => {
  assert.deepEqual(ADMIN_NAV_GROUPS.map((group) => group.label), ['站点', '内容管理', '工具与支持'])
  assert.deepEqual(ADMIN_NAV_GROUPS.map((group) => group.items.map((item) => item.key)), [
    ['overview'],
    ['hero', 'about', 'stats', 'experience', 'education', 'skills', 'projects', 'contact'],
    ['assistant', 'guide', 'account'],
  ])
  assert.deepEqual(ADMIN_TABS.map((item) => item.key), [
    'overview', 'hero', 'about', 'stats', 'experience', 'education',
    'skills', 'projects', 'contact', 'assistant', 'guide', 'account',
  ])
})

test('keeps the usage guide out of assistant sub-tabs', () => {
  assert.deepEqual(ASSISTANT_SUB_TABS.map((item) => item.key), ['resume', 'palette', 'chat'])
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test client/src/admin/navigation.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `navigation.ts`.

- [ ] **Step 3: Add the minimal navigation module**

```ts
import type { IconName } from '../components/icons'

export type AdminTabKey =
  | 'overview' | 'hero' | 'about' | 'stats' | 'experience' | 'education'
  | 'skills' | 'projects' | 'contact' | 'assistant' | 'guide' | 'account'

export type AssistantTabKey = 'resume' | 'palette' | 'chat'

type NavItem<K extends string> = { key: K; label: string; icon: IconName }

export const ADMIN_NAV_GROUPS: { key: string; label: string; items: NavItem<AdminTabKey>[] }[] = [
  { key: 'site', label: '站点', items: [{ key: 'overview', label: '全局设置', icon: 'settings' }] },
  {
    key: 'content', label: '内容管理', items: [
      { key: 'hero', label: '首屏 Hero', icon: 'sparkles' },
      { key: 'about', label: '关于我', icon: 'user' },
      { key: 'stats', label: '数据统计', icon: 'star' },
      { key: 'experience', label: '工作经历', icon: 'briefcase' },
      { key: 'education', label: '教育背景', icon: 'graduation' },
      { key: 'skills', label: '技能栈', icon: 'grid' },
      { key: 'projects', label: '项目展示', icon: 'link' },
      { key: 'contact', label: '联系与社交', icon: 'mail' },
    ],
  },
  {
    key: 'tools', label: '工具与支持', items: [
      { key: 'assistant', label: '智能助手', icon: 'sparkles' },
      { key: 'guide', label: '使用指南', icon: 'settings' },
      { key: 'account', label: '账号与数据', icon: 'key' },
    ],
  },
]

export const ADMIN_TABS = ADMIN_NAV_GROUPS.flatMap((group) => group.items)
export const ASSISTANT_SUB_TABS: NavItem<AssistantTabKey>[] = [
  { key: 'resume', label: '简历导入', icon: 'upload' },
  { key: 'palette', label: '配色助手', icon: 'sparkles' },
  { key: 'chat', label: 'AI 问答', icon: 'send' },
]
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test client/src/admin/navigation.test.ts`

Expected: 2 tests pass, 0 fail.

### Task 2: Render Grouped Admin Navigation

**Files:**
- Modify: `client/src/admin/AdminApp.tsx`

- [ ] **Step 1: Replace local tab declarations with the shared navigation imports**

```ts
import { ADMIN_NAV_GROUPS, ADMIN_TABS } from './navigation'
import type { AdminTabKey } from './navigation'
```

Use `AdminTabKey` for the active tab state. Remove the local `TabKey` and `TABS` declarations.

- [ ] **Step 2: Render desktop groups and keep the existing active-item animation**

```tsx
{ADMIN_NAV_GROUPS.map((group) => (
  <div key={group.key} className="mb-4 last:mb-0">
    <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase text-faint">{group.label}</p>
    <div className="space-y-0.5">
      {group.items.map((item) => (
        <button
          key={item.key}
          onClick={() => setTab(item.key)}
          className={cn(
            'relative flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-colors',
            tab === item.key ? 'text-ink' : 'text-muted hover:text-ink',
          )}
        >
          {tab === item.key && (
            <motion.span
              layoutId="admin-tab"
              className="absolute inset-0 rounded-xl border border-line bg-card-strong"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <Icon name={item.icon} size={16} className="relative" />
          <span className="relative">{item.label}</span>
          {item.key === 'hero' && dirty && tab !== 'hero' && (
            <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      ))}
    </div>
  </div>
))}
```

Keep the existing button classes, active `motion.span`, icon, label, and dirty indicator behavior.

- [ ] **Step 3: Render mobile navigation from the flattened source**

Replace the mobile `TABS.map` call with `ADMIN_TABS.map`, preserving the existing horizontal mobile control styling.

- [ ] **Step 4: Run focused tests and type checking**

Run: `node --test client/src/admin/navigation.test.ts && npm run build -w client -- --emptyOutDir=false`

Expected: navigation tests pass and TypeScript/Vite exits 0.

### Task 3: Extract Usage Guide And Simplify Assistant Tabs

**Files:**
- Create: `client/src/admin/Guide.tsx`
- Modify: `client/src/admin/Assistant.tsx`
- Modify: `client/src/admin/AdminApp.tsx`

- [ ] **Step 1: Move the existing guide without changing its content**

Move `GUIDE_SECTIONS`, `FAQS`, and `GuideTab` from `Assistant.tsx` into `Guide.tsx`. Rename `GuideTab` to the default-exported `Guide` component and retain its current `SectionCard`, `details`, icons, wording, and styling.

- [ ] **Step 2: Remove guide from assistant internal navigation**

```ts
import { ASSISTANT_SUB_TABS } from './navigation'
import type { AssistantTabKey } from './navigation'

const [tab, setTab] = useState<AssistantTabKey>('resume')
```

Render `ASSISTANT_SUB_TABS` and remove the old local sub-tab declarations plus the `tab === 'guide'` branch.

- [ ] **Step 3: Add Guide to the main admin content switch**

```tsx
import Guide from './Guide'

{tab === 'guide' && <Guide />}
```

Place the branch next to the assistant branch. The component receives no draft setter, so it cannot mark site data dirty.

- [ ] **Step 4: Run the focused test and full client build**

Run: `node --test client/src/admin/navigation.test.ts && npm run build -w client`

Expected: 2 tests pass and the production client build exits 0.

### Task 4: Restart And Browser-Verify

**Files:**
- No source changes expected

- [ ] **Step 1: Restart the production server on port 8788**

Stop only the listener whose current working directory is this project, then run:

```bash
NODE_ENV=production PORT=8788 node server/index.js
```

- [ ] **Step 2: Verify server identity and assets**

Run health, site-data, HTML, JS, and listener checks against `http://127.0.0.1:8788`.

Expected: all HTTP checks return 200, site name is `李智豪`, and the listener cwd is this project.

- [ ] **Step 3: Verify desktop behavior in the browser**

Confirm the three group labels are visible, click Usage guide, confirm guide content appears, click Assistant, and confirm only Resume import, Palette assistant, and AI chat remain. Confirm no console errors or warnings.

- [ ] **Step 4: Verify mobile behavior in the browser**

Use a mobile viewport, confirm the flattened navigation follows the approved order, select Usage guide, and verify content fits without horizontal page overflow. Restore the browser viewport afterward.

## Repository Constraint

This directory is not a Git repository. Commit steps are intentionally omitted; no branch, worktree, or commit can be created here.
