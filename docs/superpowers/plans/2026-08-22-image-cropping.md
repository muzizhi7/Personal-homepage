# Admin Image Cropping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mandatory crop-and-confirm step to every local image upload in the admin.

**Architecture:** Central crop presets define each field's target aspect and maximum output size. A pure crop utility calculates bounded output dimensions and renders confirmed crop pixels through Canvas, while a portal-based `ImageCropDialog` owns the drag, zoom, reset, cancel, and confirm UI. The existing `ImagePicker` remains the only upload entry and calls the existing upload API only after the dialog returns a cropped file.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, react-easy-crop 6, browser Canvas, Node.js built-in test runner

---

### Task 1: Define Crop Presets And Output Sizing

**Files:**
- Create: `client/src/admin/image-crop.test.ts`
- Create: `client/src/admin/image-crop.ts`

- [ ] **Step 1: Write the failing preset and sizing tests**

Test exact preset aspects and maximum sizes for `square`, `about`, and `project`. Test that a 2400 by 1200 project crop becomes 1600 by 800, while a 600 by 300 crop remains 600 by 300.

- [ ] **Step 2: Run the test to verify RED**

Run: `node --test client/src/admin/image-crop.test.ts`

Expected: FAIL because `image-crop.ts` does not exist.

- [ ] **Step 3: Add the preset map and pure sizing helper**

Define `ImageCropPresetKey`, `ImageCropPreset`, `IMAGE_CROP_PRESETS`, and `calculateCropOutputSize`. Keep the preset labels, numerical aspect ratios, maximum dimensions, and preview aspect classes in one source of truth.

- [ ] **Step 4: Add the Canvas crop exporter**

Add `createCroppedImageFile(sourceUrl, cropPixels, originalFile, preset)`. Load the object URL, calculate bounded dimensions, draw the selected source rectangle, preserve PNG output, convert other inputs to WebP at quality 0.92, and reject when loading or `canvas.toBlob` fails.

- [ ] **Step 5: Run the test to verify GREEN**

Run: `node --test client/src/admin/image-crop.test.ts`

Expected: 2 tests pass and 0 fail.

### Task 2: Build The Crop Dialog

**Files:**
- Modify: `client/package.json`
- Modify: `package-lock.json`
- Create: `client/src/admin/ImageCropDialog.tsx`

- [ ] **Step 1: Install the proven crop interaction library**

Run: `npm install react-easy-crop@^6.2.3 -w client`

Expected: the client dependency and root lockfile are updated without audit errors that block installation.

- [ ] **Step 2: Implement the portal-based dialog**

Render `react-easy-crop` in a `createPortal(document.body)` dialog with the selected preset aspect, a stable responsive crop viewport, zoom range 1 to 3, touch gestures, grid, and object containment.

- [ ] **Step 3: Implement complete dialog controls**

Provide icon-led close and reset controls with tooltips, a zoom slider, “取消”, and “确认并上传”. Disable dismissal while confirming. Support Escape and backdrop cancellation, stop background scrolling while open, expose `role="dialog"` and `aria-modal="true"`, and report crop/render errors inside the dialog.

- [ ] **Step 4: Verify TypeScript**

Run: `./node_modules/.bin/tsc -p client/tsconfig.json --noEmit`

Expected: exit 0.

### Task 3: Require Confirmation Before Image Upload

**Files:**
- Modify: `client/src/admin/fields.tsx:220`
- Modify: `client/src/admin/editors.tsx:38`
- Modify: `client/src/admin/AdminApp.tsx:35`

- [ ] **Step 1: Add pending-file state to `ImagePicker`**

Replace direct upload-on-file-change with file type and 10 MB size validation, an object URL, image decode preflight, and pending crop state. Reset the native file input after every selection so the same file can be selected twice.

- [ ] **Step 2: Wire confirmation to the existing upload API**

Open `ImageCropDialog` for a valid pending file. On confirmation, create the cropped `File`, call `api.upload`, and invoke `onChange` only after upload success. On cancel or error, keep the existing value unchanged and revoke temporary object URLs.

- [ ] **Step 3: Map every picker to its target preset**

Set favicon and Hero avatar to `square`, About image to `about`, and project cover to `project`. Use each preset's preview aspect class so the admin preview matches the public target.

- [ ] **Step 4: Run focused regression tests and TypeScript**

Run: `node --test client/src/admin/image-crop.test.ts client/src/site/profile-avatar.test.ts client/src/admin/navigation.test.ts && ./node_modules/.bin/tsc -p client/tsconfig.json --noEmit`

Expected: all tests pass and TypeScript exits 0.

### Task 4: Build, Restart, And Browser-Verify

**Files:**
- Generated: `client/dist/**`

- [ ] **Step 1: Build and synchronize static data**

Run: `npm run build`

Expected: TypeScript and Vite production build exit 0, then static data and uploads are copied.

- [ ] **Step 2: Restart only this project's listener**

Resolve port 8788's PID and cwd, stop it only after confirming the cwd is `/Users/lizhihao/Documents/个人主页`, then launch `NODE_ENV=production PORT=8788 node server/index.js` from the project root.

- [ ] **Step 3: Verify all crop entry mappings in the browser**

Open the admin and confirm favicon and Hero show a square crop frame, About shows 4:3, and project covers show 2:1. Confirm choosing a file does not change the field or create an upload before confirmation.

- [ ] **Step 4: Verify dialog behavior and real upload**

Confirm drag, zoom, reset, Escape/backdrop cancel, same-file reselection, and “确认并上传”. Verify the resulting preview and public image use the cropped asset, mobile layout has no overflow, and the browser console has no warnings or errors.

## Repository Constraint

This directory is not a Git repository. Skip every commit, branch, worktree, merge, and pull-request step while preserving all existing files and the running service outside the scoped restart.
