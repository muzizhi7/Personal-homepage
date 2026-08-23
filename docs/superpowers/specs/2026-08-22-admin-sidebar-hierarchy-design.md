# Admin Sidebar Hierarchy Design

## Goal

Make the admin navigation hierarchy easier to scan and move the usage guide out of the assistant's internal tabs into a first-class admin destination.

## Navigation Structure

The desktop sidebar uses three visible, non-collapsible groups:

1. Site
   - Global settings (`overview`)
2. Content management
   - Hero (`hero`)
   - About (`about`)
   - Statistics (`stats`)
   - Experience (`experience`)
   - Education (`education`)
   - Skills (`skills`)
   - Projects (`projects`)
   - Contact and social (`contact`)
3. Tools and support
   - Assistant (`assistant`)
   - Usage guide (`guide`)
   - Account and data (`account`)

The usage guide must immediately follow the assistant. The mobile horizontal navigation keeps the same flattened item order without group headings, because group headings would consume scarce horizontal space.

## Component Boundaries

- Add a pure navigation configuration module that owns tab keys, group labels, item order, labels, and icons.
- Render the desktop sidebar from grouped navigation data.
- Render the mobile navigation from a flattened view of the same data so the two surfaces cannot drift.
- Move the guide content and its static data into a dedicated `Guide` component.
- Remove `guide` from the assistant sub-tab type, sub-tab list, and conditional rendering.
- Add `guide` to the main admin tab union and render the dedicated component from `AdminApp`.

## Behavior

- Selecting Usage guide changes only the active admin tab.
- Opening or browsing the guide does not mark the site draft dirty.
- Existing save, preview, authentication, assistant, and content-editing behavior stays unchanged.
- Group headings are labels, not buttons, and do not introduce collapse state.
- Existing active-item animation remains on the selected navigation item.

## Validation

- A focused automated test verifies the three groups, exact item order, the assistant-guide adjacency, and the flattened mobile order.
- A focused automated test verifies that assistant sub-tabs contain only resume import, palette assistant, and AI chat.
- TypeScript and production build must pass.
- After restart, browser verification covers desktop sidebar grouping, guide navigation, absence of the assistant's old guide tab, mobile navigation, console state, and one real navigation interaction.

## Out Of Scope

- Collapsible groups.
- URL-based deep links for admin tabs.
- Redesigning guide content.
- Changes to public-site navigation or site data.
