# OPS Product Audit

Date: 2026-10-06 (refreshed source/API audit)

## Executive Summary

OPS has a capable Next.js/MongoDB foundation with routes for the core personal-work entities and a shared shell. The highest-risk gaps are inconsistent persistence and interaction behavior rather than a need for a visual rewrite. In particular, Tasks and the Today timeline are user-scoped, while several older resource routes and Calendar plans follow older, inconsistent patterns. The current UI also has three separate dialog implementations, native destructive confirmations, and a mix of desktop-first inline styles and reusable classes.

The recommended approach is targeted: standardize the interaction primitives first, complete the missing College hierarchy, move Calendar plans onto the existing authenticated persistence model, and then tighten page-level responsive layouts. Preserve the current OPS dark/light identity and navigation model.

## P0 Issues

| Issue | Page/component | Why it is a problem | Recommended fix |
| --- | --- | --- | --- |
| Calendar plans persist only in `localStorage` (`ops_calendar_plans_v2`) while the timeline has an authenticated MongoDB route. | Calendar, Today | Plans disappear across browsers/devices and are not account-scoped; the calendar can disagree with the timeline after a refresh or login change. | Add an authenticated calendar-plan route/model and migrate Calendar/Today reads and writes from local storage. |
| Core resource ownership is inconsistent. Tasks and TodayTimeline require a session/user ID, but College routes do not call `requireSession`; the audit also found legacy public-style routes for People, Meetings, and Projects. | `app/api/{college,people,meetings,projects}` | In a multi-account OPS product, unscoped records risk cross-account visibility and modification. | Audit each entity’s schema and add `userId` plus server-side session filters through a deliberate migration. Do not perform a blind schema rewrite. |

## P1 Issues

| Issue | Page/component | Why it is a problem | Recommended fix |
| --- | --- | --- | --- |
| Native confirmations remain. | Tasks, Account inbox disconnect | `confirm()` is visually inconsistent, inaccessible to the shared dialog focus handling, and cannot show loading/error state. | Replace with `AppModal`-based confirmation dialogs. |
| College hierarchy stops at Subject → Unit. Units do not contain topics, so topic create/edit/delete/complete is impossible. | `CollegeSubject` model and College page | Does not meet the stated syllabus workflow and forces users to track topic progress elsewhere. | Add a nested Topic schema and targeted unit/topic CRUD controls with persistence. |
| Modal implementations are duplicated. | `AppModal`, `.modal-overlay/.modal`, `.modal-backdrop/.modal-card`, Reminder Center, Books, Forge, Learning, Life, Reviews, GSoC forms | Escape, focus trapping, scroll lock, backdrop semantics, and mobile behavior differ by page. | Migrate core forms and destructive dialogs to `AppModal`; retain legacy styles only during incremental conversion. |
| The Calendar day inspector is a bespoke overlay, not the shared modal, and Calendar loads five resource endpoints even when its local plans are the primary mutable data. | Calendar | Creates inconsistent overlay behavior and can present stale/partial workload information after failed requests. | Convert inspector to `AppModal` and surface fetch failures/loading state. Move mutable plans to the server route. |
| Delete feedback is uneven. | Tasks, Meetings, People, Books, Learning, Forge, Reviews, GSoC pages | Several handlers optimistically reload or silently fail without a visible error/success message. | Introduce one lightweight toast/feedback primitive and use response checks for core CRUD. |

## P2 Issues

| Issue | Page/component | Why it is a problem | Recommended fix |
| --- | --- | --- | --- |
| Page width/padding is defined with many page-local inline values. | Most route pages, notably Calendar and Today | Breakpoints cannot consistently control spacing, producing a desktop UI compressed on phones. | Introduce a shared `.page-container` with 14px mobile / 24px desktop padding, then migrate core pages incrementally. |
| Modal CSS has overlapping class families and z-index conventions. | `globals.css` | Future overlays can render over/under the FAB, nav, or another dialog unpredictably. | Publish a z-index token scale and make `AppModal` the top-level dialog primitive. |
| Mobile navigation/FAB behavior is globally styled, with Calendar-specific `:has()` adjustments. | AppShell, globals | The adjustment works only on supporting browsers and encourages route-specific navigation rules. | Add an AppShell page variant/class prop for pages needing a compact mobile chrome. |
| Project create/edit form remains a legacy manual modal while delete uses `AppModal`. | Projects | A single entity has inconsistent dialog behavior. | Convert create/edit to `AppModal` after core confirmations. |
| Icon system mixes custom SVG, Unicode arrows, and emoji in management views. | AppShell, Calendar, Today, entity pages | Visual rhythm and color meaning vary between pages. | Keep existing SVG nav icons; replace interactive emoji/control glyphs in core productivity routes with the existing icon style. |
| Search has no result keyboard navigation/recent state. | `GlobalSearch` in AppShell | Keyboard-first search is incomplete and less accessible. | Add active-result state, ArrowUp/Down, Enter, Escape, type labels, and an intentional empty state. |

## P3 Issues

| Issue | Page/component | Why it is a problem | Recommended fix |
| --- | --- | --- | --- |
| Some forms use dense, one-line JSX and inline style objects. | College and several feature pages | Harder to audit and apply consistent responsive rules. | Extract small form sections only where reused or unusually complex. |
| Some local-only wellness/reminder data is still intentionally browser-local. | Life, Reminder settings | It is not cross-device persistent, but may be valid for a browser preference/log prototype. | Decide product ownership requirements before migrating; do not treat all local storage as a defect. |
| No automated viewport regression suite is present. | Whole app | Responsive regressions are likely when large inline layouts change. | Add Playwright viewport smoke tests after the shared layout primitives stabilize. |

## Responsive Problems

- Calendar required a dedicated phone layout; this has now been addressed with a compact grid and selected-day agenda.
- Most route pages rely on inline flex/grid declarations. They need viewport checks at 375, 390, 430, 768, 1024, 1280, 1440, and 1920px before claiming full coverage.
- Legacy modal forms use separate overlay styles, so keyboard, viewport height, and mobile keyboard behavior are not reliably shared.
- Bottom navigation is safe-area aware, but content spacing and FAB offsets are not consistently page-owned.

## CRUD Matrix

| Entity | Create | Read | Edit | Delete | Audit result |
| --- | --- | --- | --- | --- | --- |
| Tasks | Yes | Yes | Yes | Yes | Complete API surface; delete confirmation/feedback need standardization. |
| Meetings | Yes | Yes | Yes | Yes | Complete API surface; modal/feedback need standardization. |
| Projects | Yes | Yes | Yes | Yes | Complete API surface; create/edit modal differs from delete dialog. |
| People | Yes | Yes | Yes | Yes | Complete API surface; modal/feedback need standardization. |
| Calendar plans/events | Partial | Partial | Partial | Partial | Local storage plans and bespoke inspector; no dedicated account-scoped calendar entity. |
| Subjects | Yes | Yes | Yes | Yes | Complete subject CRUD, currently unscoped. |
| Units | Yes | Yes | Partial | Partial | Can add and update embedded array; no dedicated edit/delete unit UI. |
| Topics | No | No | No | No | Missing model and user flow. |

## Component Duplication

- Dialogs: `AppModal`, `.modal-overlay/.modal`, `.modal-backdrop/.modal-card`, and bespoke overlays.
- Confirmation behavior: native `confirm()`, immediate delete, and `AppModal` confirmation.
- Feedback: inline errors, console errors, and silent reloads; no shared toast.
- Layout: repeated page-local width, padding, cards, and action rows.

## Recommended Fix Order

1. Replace native confirmations in Tasks and Account with `AppModal`; add shared CRUD feedback.
2. Complete College Unit/Topic CRUD and use the common confirmation pattern.
3. Move Calendar plans from local storage to authenticated MongoDB persistence, then connect Calendar and Today to it.
4. Migrate core create/edit forms (Projects, Meetings, People, Tasks) to `AppModal` and shared validation/error behavior.
5. Add a shared page-container and apply it to Home, Today, Calendar, Tasks, Meetings, People, Projects, College, and Account.
6. Audit API ownership migration entity-by-entity, with data migration and tests.
7. Add responsive browser tests and keyboard-search coverage.

## 2026-10-06 Refresh Findings

### P0 — confirmed ownership boundary

The current `CollegeSubject`, `Person`, `Project`, and `Meeting` schemas do not contain a `userId`; their collection and ID routes do not require a session or filter by an owner. This is a P0 privacy and data-integrity defect for a multi-account product. It must be handled through an approved, deliberate migration: add `userId`, backfill existing data, require a session, then filter every list and mutation. This audit intentionally did not make that material API/schema change.

Update: College, People, and Projects now require the signed-in user and scope every collection and ID operation. College Units now persist Topic create/read/edit/delete/complete interactions. Existing unowned records are deliberately not auto-assigned, so they remain preserved but invisible until an administrator assigns their verified owner. Meetings remains pending because its route/model files were already modified in the working tree and were not overwritten by this audit pass.

### P1/P2 — confirmed interaction consistency

- `AppModal` is used for some core confirmations, while Projects create, People/Meetings/Tasks forms, Reminder Center, and several feature pages retain legacy modal markup.
- Native `confirm()` calls remain in Reminder Center and numerous feature/detail pages.
- Production compilation reports that Reminder Center imports four missing notification exports (`getStoredScheduledReminders`, `syncAllTodayReminders`, `sendTestNotification`, and `cancelAllReminders`). Until its in-progress notifications module is reconciled, reminder actions are a P1 functional regression.
- Projects creates with legacy markup but deletes with `AppModal`, so its own CRUD flow is inconsistent.
- Global search returns typed results but has no active result, arrow-key navigation, Enter behavior, or intentional no-result state.
- Z-index values are scattered across inline styles and CSS; shared overlays need a tokenized layer scale.

### Responsive validation status

The local Next server starts successfully. The supplied in-app browser cannot reach `http://localhost:3000` from this execution environment (connection timeout), so live checks at 375, 390, 430, 768, 1024, 1280, 1440, and 1920px could not be completed. The report does not claim viewport validation; source-level responsive risks remain as described above.

## Audit Method and Limits

This report is based on source and route inspection, API/model review, and production compilation. It does not claim device-viewport visual validation because no browser/device screenshot run has been completed in this audit turn.
