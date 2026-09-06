# Motora — Customer Web App

A customer-facing marketplace for used cars in Gaborone, Botswana. Buyers browse
listings from garages and dealers across the city, compare them, and contact the
seller directly.

This repository is **only** the customer web app. The backend API and the admin
dashboard are separate projects.

```
React + Vite customer app   ←  this repository
        ↓
   Backend API              ←  not yet built
        ↓
   Firebase                 ←  vehicle data, garage data, listing photos
```

## Running it

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` against bundled mock data. Copy
`.env.example` to `.env` if you want to change the data source or exercise the
error states.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run build:meta` | Build the server-side metadata bundle |
| `npm run serve` | Serve the build with link-preview injection |
| `npm run lint` | Lint with oxlint |

## Architecture

The guiding constraint is that **no UI component knows where its data comes
from**. Swapping mock data for the real API is a change in one directory.

```
src/
├── types/          Domain models — the contract the API must satisfy
├── data/           Mock fixtures (vehicles, garages, reference data)
├── services/
│   ├── repositories/
│   │   ├── types.ts        Repository interfaces
│   │   └── mock/           Mock implementations
│   ├── dataSource.ts       Chooses the implementation
│   ├── ApiError.ts         Normalised error shape
│   └── *Service.ts         Public API used by hooks
├── hooks/          Data fetching, URL query state, media queries
├── context/        Toasts, saved-vehicle shortlist
├── components/
│   ├── ui/         Primitives: Button, Badge, Field, Modal, Icon, …
│   ├── layout/     Navbar, Footer, Layout
│   ├── vehicle/    VehicleCard, VehicleGrid, VehicleGallery
│   ├── garage/     GarageCard, GaragePanel
│   ├── search/     HeroSearch, FilterPanel, ResultsToolbar
│   ├── enquiry/    EnquiryForm
│   └── common/     SafeImage
├── pages/          One component per route
├── utils/          Formatting, query serialisation, validation
└── styles/         Design tokens and global styles
```

### The data layer

Every read goes through a repository interface in
[`src/services/repositories/types.ts`](src/services/repositories/types.ts):

```ts
export interface VehicleRepository {
  search(query: VehicleQuery, signal?: AbortSignal): Promise<VehicleSearchResult>;
  getBySlug(slug: string, signal?: AbortSignal): Promise<VehicleWithGarage>;
  // …
}
```

[`dataSource.ts`](src/services/dataSource.ts) picks the implementation from
`VITE_DATA_SOURCE`. To move onto the real backend:

1. Add `src/services/repositories/api/` (or `firebase/`) implementing the same
   three interfaces.
2. Register it in `resolveDataSource()` under a new `VITE_DATA_SOURCE` value.
3. Change nothing else. Hooks, pages and components are already decoupled.

`VehicleQuery` is deliberately flat and serialisable, so the same object maps
onto a REST query string, a Firestore query, and the URL search params.

### Finance estimates

Most people buying a P350,000 bakkie here shop against what their bank will
approve each month, not against the sticker price.
[`src/utils/finance.ts`](src/utils/finance.ts) turns a price into that number:
standard amortisation, with an optional balloon, which is common on local
vehicle finance and the reason two quotes on the same car can look very
different.

It is arithmetic, not an offer. Motora is not a lender or a broker. Every
assumption — deposit, term, rate, balloon — is set and visible to the
customer, the default rate is a deliberately round placeholder rather than a
scraped market figure, and the panel states that banks add initiation fees,
admin fees and required insurance, so a real quote will come out higher.
Nothing here should ever be presented as an approval or as advice to borrow.

The estimate appears twice: as a small line under the price on every vehicle
card, and as the full calculator on the listing page. Both read the same
assumptions from
[`FinanceSettingsContext`](src/context/FinanceSettingsContext.tsx), so a card
can never disagree with the calculator the customer has already adjusted, and
the settings persist per device. A context rather than a per-component hook
because a browse page renders a dozen cards, and each holding its own copy
would mean a dozen localStorage writes per change.

Cards label the figure `est.` and carry the full assumptions in a tooltip.
Sold listings show no repayment figure at all.

### Comparison

Comparing is a separate set from the saved shortlist, and deliberately so:
saving means "keep this for later", comparing means "weigh these against each
other now". A customer routinely saves eight cars and compares three.

[`CompareContext`](src/context/CompareContext.tsx) holds up to four vehicle ids
in localStorage. [`CompareTray`](src/components/compare/CompareTray.tsx) is
mounted in the layout so a set survives navigation between browse, garage and
detail pages — which is exactly when candidates get collected.

[`buildCompareRows`](src/utils/compare.ts) produces the table. Each row knows
whether its values are identical across the set, so "show differences only" is
a filter rather than a re-query, and rows with an objectively better direction
(cheaper, fewer kilometres, newer, verified) mark their winners. Attributes
without a better direction — fuel type, colour, body type — are never ranked.

The table is a CSS grid rather than a `<table>`, so the label column can stick
while the vehicle columns scroll horizontally on a phone.

### Link previews

Listings get shared into WhatsApp groups, and WhatsApp does not execute
JavaScript. Neither do Facebook, LinkedIn or Slack. A client-rendered SPA
therefore shows the same generic card for every listing unless something puts
the right tags in the served HTML first.

Three pieces:

1. [`src/utils/meta.ts`](src/utils/meta.ts) builds the metadata. It is free of
   React, the DOM and Vite globals so it runs unchanged in the browser and on a
   server. `previewImageUrl` re-crops the listing photo to the 1200×630 that
   crawlers expect — the gallery original is the wrong shape and often too
   large for WhatsApp to accept.
2. [`usePageMeta`](src/hooks/usePageMeta.ts) applies it in the browser. That
   covers tab titles, bookmarks and crawlers that do run scripts, such as
   Googlebot. It owns the JSON-LD slot outright, so a client-side navigation
   never leaves structured data describing the previous page.
3. [`server/meta-injector.mjs`](server/meta-injector.mjs) rewrites the HTML
   head per URL, calling the same builders through
   [`src/server/meta-entry.ts`](src/server/meta-entry.ts). A preview card can
   never describe a listing differently from the page itself.

```bash
npm run build && npm run build:meta && npm run serve
```

Sold listings and filtered searches are served `noindex`, since neither belongs
in a search index.

**Deploying this.** The injector is a reference host, not the intended
production setup. In production the same two exports — `resolveMeta` and
`metaTags` — belong in an edge middleware in front of the static build
(Vercel, Netlify or Cloudflare all support this shape). Plain static hosting
will serve the generic card and previews will not work.

**Testing a real preview.** Crawlers need a public URL, so a local server is
not enough. Expose it with a tunnel and paste the link into a WhatsApp chat
with yourself, or use Facebook's Sharing Debugger to force a re-scrape.

### Search state lives in the URL

`useVehicleQuery` reads and writes the browse page's filters as search params.
Results are shareable, the back button steps through filter changes, and a
refresh restores exactly what was on screen.

### Errors and loading

Repositories translate failures into `ApiError` with a `code`, so the UI renders
one consistent set of states. `useAsyncData` handles cancellation on unmount and
on dependency change, distinguishes first load (skeletons) from refresh (dimmed
results), and exposes a `retry` handle.

Set `VITE_MOCK_FAILURE_RATE=0.3` to see the error states without unplugging the
network.

## Design system

Brand palette, type scale, spacing, radii, shadows and motion are defined once
in [`src/styles/tokens.css`](src/styles/tokens.css). Components consume the
variables and never hard-code values.

### Type and voice

Two families do different jobs:

- **Archivo** (variable, width axis) carries page and section headings, prices
  and stat figures — run wide and uppercase, it gives the product a poster
  voice instead of the default card-grid look. Applied automatically to `h1`
  and `h2`, plus the `.display` and `.numeric` utilities.
- **Inter** carries the interface — body copy, labels, card titles, controls —
  where legibility at small sizes matters more than character.

The **road rule** is the signature graphic element: the dashed centre line
running through the logo's "M", reused as `--road-dash`. It opens every section
header, underlines the hero, marks the body-type tiles, and sweeps across a
vehicle card on hover. It is the one motif that makes a screenshot recognisable
as Motora.

| Token | Value | Used for |
| --- | --- | --- |
| `--navy` | `#0B1220` | Headers, footer, strong text, dark sections |
| `--blue` | `#2563EB` | Primary actions, links, active states |
| `--off-white` | `#F8FAFC` | Page background |
| `--slate` | `#64748B` | Secondary text and metadata |
| `--green` | `#22C55E` | Availability and success states only |

The hierarchy is off-white and navy, with blue for action. Green is kept scarce
so that it still means something when it appears.

### Brand assets

The logo lives at [`src/assets/motora-logo.webp`](src/assets/motora-logo.webp)
(440×143, 27 KB), cropped and resized from the original `assets/motoralogo.png`
supplied by the client, which is kept as the source of truth.

It is drawn light-on-dark — the wordmark is half white — so it cannot sit bare
on a light surface. The [`Logo`](src/components/common/Logo.tsx) component
encodes the rule:

- **Dark surfaces** (footer): rendered bare. The artwork's own soft glow blends
  into `--navy`, leaving no visible edge.
- **Light surfaces** (navbar): `plate` wraps it in a navy badge so the white
  half of the wordmark stays legible.

The browser and app icon, [`public/motora-icon.png`](public/motora-icon.png), is
the logo's "M" mark flattened onto `--navy`.

Styling is CSS Modules — scoped by default, no runtime cost, no extra
dependency. Typography is Inter.

## Local context

- Prices are Botswana Pula, formatted as `P348,000`.
- Areas, garages and vehicle mixes reflect the Gaborone market.
- WhatsApp is a first-class contact method, with the vehicle and price
  pre-filled into the message.
- Terminology is local: bakkie, double cab, blue book, Omang.

## Mock data

24 vehicles across 8 garages, in
[`src/data/vehicles.ts`](src/data/vehicles.ts) and
[`src/data/garages.ts`](src/data/garages.ts). Seeds carry only what varies; a
builder derives slugs, image sets and timestamps the way the backend would, so
the exported arrays match the API response shape exactly.

**Photography is placeholder stock imagery** from Unsplash, grouped by body type
so an SUV listing shows an SUV. The cars are not the specific models named in
the listings. Replace `PHOTO_SETS` with Firebase Storage URLs when real garage
photos are available.

## Accessibility

Semantic landmarks and headings, a skip link, visible focus rings, labelled form
controls with inline errors, `aria-live` regions for toasts, focus trapping and
restoration in modals and drawers, and full keyboard support in the gallery.
`prefers-reduced-motion` disables animation throughout.

## Not built here

Authentication, payments, finance calculators, saved searches, admin tooling and
garage self-service. The shortlist is stored in `localStorage`; when accounts
exist, `SavedVehiclesContext` is the only file that needs to sync to the backend.
