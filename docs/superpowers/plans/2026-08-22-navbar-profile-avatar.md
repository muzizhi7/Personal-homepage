# Navbar Profile Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the configured Hero avatar in the public navbar with a reliable localized-name fallback.

**Architecture:** A pure helper normalizes the shared Hero avatar URL and fallback initial. `Navbar` owns transient image-load failure state, resets it when the configured URL changes, and switches between the image and the existing gradient initial without changing layout dimensions.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, Node.js built-in test runner

---

### Task 1: Specify Avatar Resolution

**Files:**
- Create: `client/src/site/profile-avatar.test.ts`
- Create: `client/src/site/profile-avatar.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveProfileAvatar } from './profile-avatar.ts'

test('uses the configured Hero avatar and localized-name fallback', () => {
  assert.deepEqual(resolveProfileAvatar('/uploads/me.jpg', '李智豪'), {
    src: '/uploads/me.jpg',
    initial: '李',
  })
  assert.deepEqual(resolveProfileAvatar('   ', 'Zhihao Li'), { src: null, initial: 'Z' })
  assert.deepEqual(resolveProfileAvatar('', ''), { src: null, initial: '?' })
})
```

- [ ] **Step 2: Verify RED**

Run: `node --test client/src/site/profile-avatar.test.ts`

Expected: FAIL because `profile-avatar.ts` does not exist.

- [ ] **Step 3: Add the minimal pure helper**

```ts
export function resolveProfileAvatar(avatar: string, name: string) {
  const src = avatar.trim()
  return {
    src: src || null,
    initial: (name || '?').trim().charAt(0).toUpperCase() || '?',
  }
}
```

- [ ] **Step 4: Verify GREEN**

Run: `node --test client/src/site/profile-avatar.test.ts`

Expected: 1 test passes, 0 fail.

### Task 2: Render The Shared Avatar In Navbar

**Files:**
- Modify: `client/src/site/Navbar.tsx`

- [ ] **Step 1: Add load-failure state and reset behavior**

```ts
const avatarUrl = site?.hero.avatar ?? ''
const [avatarFailed, setAvatarFailed] = useState(false)

useEffect(() => setAvatarFailed(false), [avatarUrl])
```

- [ ] **Step 2: Replace the initial-only mark**

```tsx
const profileAvatar = resolveProfileAvatar(avatarUrl, t(site.hero.name))
const showAvatar = Boolean(profileAvatar.src && !avatarFailed)

<span
  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-[15px] font-bold text-white"
  style={showAvatar ? undefined : { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
>
  {showAvatar ? (
    <img
      src={profileAvatar.src!}
      alt={t(site.hero.name)}
      className="h-full w-full object-cover"
      onError={() => setAvatarFailed(true)}
    />
  ) : (
    profileAvatar.initial
  )}
</span>
```

- [ ] **Step 3: Run automated verification**

Run: `node --test client/src/site/profile-avatar.test.ts client/src/admin/navigation.test.ts && ./node_modules/.bin/tsc -p client/tsconfig.json --noEmit`

Expected: all tests pass and TypeScript exits 0.

### Task 3: Build, Restart, And Browser-Verify

**Files:**
- Generated: `client/dist/**`

- [ ] **Step 1: Build and synchronize static data**

Run from `client`: `../node_modules/.bin/vite build && node ../scripts/build-static.mjs`

Expected: production build exits 0 and uploads/site data are copied.

- [ ] **Step 2: Restart only this project's port 8788 listener**

Verify listener cwd, stop that PID, then run `NODE_ENV=production PORT=8788 node server/index.js` from the project root.

- [ ] **Step 3: Verify live behavior**

Confirm navbar and Hero images have the same resolved `src`, navbar image is 32 by 32 pixels at desktop size, mobile has no page overflow, public/admin routes remain usable, and browser console has no warnings or errors.

## Repository Constraint

This directory is not a Git repository, so no branch, worktree, or commit step is available.
