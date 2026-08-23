# Navbar Profile Avatar Design

## Goal

Use the configured Hero avatar in the public-site navbar so the compact identity mark and the Hero portrait always come from the same setting.

## Behavior

- Read the navbar image from `site.hero.avatar`; do not add another configuration field.
- When the avatar is present and loads successfully, render it inside the existing 32 by 32 pixel rounded-square navbar mark with `object-cover`.
- When the avatar is empty or fails to load, render the current localized-name initial on the existing accent gradient.
- Reset a previous load failure when the configured avatar URL changes.
- Saving a Hero avatar in the admin continues to refresh public-site data through the existing site reload flow.

## Scope

- Add a small pure helper for avatar URL normalization and localized-name fallback.
- Update only the public `Navbar` identity mark.
- Keep the Hero portrait, navbar sizing, name label, links, and animations unchanged.

## Validation

- Automated tests cover configured avatar priority, whitespace-only avatar fallback, and localized-name initial fallback.
- TypeScript and production build must pass.
- Browser verification checks the navbar and Hero images use the same source, dimensions remain stable, mobile layout has no horizontal overflow, and console state is clean.
