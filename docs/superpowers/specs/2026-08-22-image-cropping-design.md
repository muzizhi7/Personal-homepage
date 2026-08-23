# Image Cropping Design

## Goal

Require every local image upload in the admin to pass through a crop-and-confirm step before the file is uploaded.

## Scope

The shared `ImagePicker` currently serves every local image-upload entry in the admin. The crop flow therefore covers:

- Site favicon: fixed 1:1 crop.
- Hero avatar: fixed 1:1 crop.
- About image: fixed 4:3 crop.
- Project cover: fixed 2:1 crop.

Resume imports and JSON configuration imports are not image uploads and remain unchanged. Directly pasted image URLs also remain unchanged because no local file is being uploaded.

## Architecture

Use `react-easy-crop` for drag, touch, zoom, and crop-boundary behavior. A focused crop utility converts the confirmed pixel rectangle to an uploadable `File` with browser Canvas. `ImagePicker` owns the pending local file and opens a shared `ImageCropDialog`; it calls the existing upload API only after the dialog returns a cropped file.

The server upload endpoint remains unchanged. This avoids uploading temporary originals and avoids storing files that the user cancels.

## Interaction

1. The user selects a local image from an empty picker or clicks “更换图片”.
2. The selected file opens in a centered crop dialog immediately; no network request has occurred.
3. The crop frame uses the field's fixed target ratio. The user can drag the image, pinch on touch screens, adjust a zoom slider, or reset the crop.
4. “取消”, Escape, or clicking the backdrop closes the dialog without uploading or changing the current field value.
5. “确认并上传” renders the crop, uploads the resulting file through the existing API, and updates the field only after the upload succeeds.
6. The file input is reset after each choice so the same file can be selected again.

The dialog traps the interaction visually above the admin, exposes dialog semantics, labels all controls, prevents background scrolling, and remains usable on mobile screens.

## Output Rules

- Favicon and Hero avatar use a square output bounded to 1024 by 1024 pixels.
- About images use a 4:3 output bounded to 1600 by 1200 pixels.
- Project covers use a 2:1 output bounded to 1600 by 800 pixels.
- The exporter never upscales beyond the selected crop's natural pixel size.
- PNG input stays PNG so transparency is preserved.
- Other supported inputs become high-quality WebP.
- Animated GIF input becomes a static cropped image, and SVG input is rasterized.

## Error Handling

- Invalid or unreadable image files show an inline error and never open a broken crop dialog.
- Canvas or upload failures keep the existing field value and show the error in the picker.
- Object URLs are revoked whenever a pending crop is replaced, canceled, confirmed, or the picker unmounts.
- While rendering or uploading, dismissal and repeated confirmation are disabled.

## Testing

- Pure tests cover fixed aspect/output presets and crop output-size calculations, including the no-upscale rule.
- Component-oriented logic verifies that selecting a local file does not upload immediately and confirmation is required before upload.
- TypeScript and the production build must pass.
- Browser verification covers all four picker contexts, crop-dialog controls, cancellation, confirmation, saved preview proportions, mobile fit, and a clean console.

## Repository Constraint

This directory is not a Git repository, so the design, plan, and implementation cannot be committed or managed in a worktree.
