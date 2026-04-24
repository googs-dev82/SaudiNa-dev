# Portal Localization Gap Analysis

## Current State

The **public website** (`/app/[locale]/`) is **already localized**:
- `[locale]` subdirectory routing with `ar` / `en`
- `localeDirection()` sets `dir="rtl"` / `dir="ltr"` on the layout `<div>`
- `defaultLocale = "ar"` is defined
- `isLocale()` guard in place
- `nameAr` / `nameEn` bilingual fields exist in all data models

The **admin portal** (`/app/portal/`) has **zero localization**:
- No `[locale]` segment in the portal route group
- Portal layout has no `lang` / `dir` attributes
- All UI strings are hardcoded English
- No language switcher in the portal header
- No user language preference stored or applied
- `nameAr` / `nameEn` fields exist in data but the portal always displays `nameEn` only

---

## What Is Missing

### 1. Portal Layout — no `lang` / `dir`

**File:** `src/app/portal/(protected)/layout.tsx`

The public layout wraps content in:
```html
<div lang={locale} dir={direction}>
```

The portal layout does **not** — it renders bare `<PortalShell>`. Arabic users would get LTR layout breaking RTL content.

---

### 2. No Language Preference in Session / User Profile

**Backend:** `User` model has no `preferredLanguage` field.

**Frontend:** `requirePortalUser()` returns a session object with no locale. There is nowhere to read or store the user's portal language preference.

**Needed:**
- Add `preferredLanguage: 'ar' | 'en'` to the `User` model (Prisma migration)
- Return it in the session/context
- Allow the user to change it from their profile page

---

### 3. No Language Switcher in the Portal Header

**File:** `src/features/portal/components/portal-site-header.tsx`

The header has a search bar and notifications bell but **no language toggle**. Users cannot switch between Arabic and English in the portal interface.

**Needed:** An `ar / en` toggle button in the header that saves the preference (cookie → profile).

---

### 4. All UI Strings Are Hardcoded English

Every label, heading, placeholder, and message in the portal is a hardcoded English string. Examples:
- `"Governed operations, scoped administration, and auditable workflows."`
- `"Search users, committees, meetings..."`
- `"Export PDF"`, `"Add Region"`, `"Deactivate"`, `"Confirm"`, `"Cancel"`

**Needed:** A translation dictionary/namespace system. Options:
- **`next-intl`** (already used by the public site pattern — best fit)
- Plain JSON locale files with a minimal `t()` helper (simpler for a portal)

---

### 5. Bilingual Data Is Not Used in the Portal

All governance entities have `nameAr` / `nameEn` fields in the database, but the portal always renders only `nameEn`. When a user switches to Arabic, they would still see English names.

**Needed:** A `useLocale()` hook (or equivalent) in portal components that selects `nameAr` vs `nameEn` based on the active locale.

---

### 6. No RTL CSS Handling for the Portal

The Tailwind config for the public site uses `dir` attribute to flip margins/paddings for RTL. The portal has no such setup — switching to Arabic would break the sidebar, form layouts, and table alignments.

**Needed:**
- Verify Tailwind `rtl:` variants are enabled in `tailwind.config.ts`
- Apply `ml-auto` → `ms-auto`, `pl-` → `ps-` (logical properties) in portal components
- Or: Add `dir="rtl"` to the portal layout and test for visual regressions

---

## Recommended Implementation Order (MVP)

| Priority | Task | Effort |
|---|---|---|
| 1 | Add `lang` / `dir` to portal layout from session locale | Low |
| 2 | Add `preferredLanguage` to `User` model + migration | Low |
| 3 | Return locale in portal session context | Low |
| 4 | Add language toggle to portal header (saves to cookie → profile) | Medium |
| 5 | Add locale files for portal UI strings (`en.json`, `ar.json`) | High |
| 6 | Replace hardcoded strings with `t()` calls | High |
| 7 | Use `nameAr`/`nameEn` dynamically based on locale | Medium |
| 8 | RTL layout audit + logical CSS properties | Medium |

---

## What Does NOT Need to Change

- Public website localization — already complete
- Data model bilingual fields (`nameAr`/`nameEn`) — already in place
- `locales`, `isLocale`, `localeDirection` config — reusable as-is for the portal
