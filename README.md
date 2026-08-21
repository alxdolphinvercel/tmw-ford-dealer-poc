# Ford Dealer Web Pages — Proof of Concept

Five standardised Ford dealer homepages, built from **one** Next.js template and
deployable to Vercel as **five independent sites**.

Built for the TMW / Accenture Song brief of 5 August 2026: demonstrate the
Fixed / Flexible / Free content model that would standardise ~190 Ford dealer
pages, benchmarked against BMW Group 1's live content framework.

| Site | Directory | Dealer accent |
|---|---|---|
| Lookers Ford | `lookers-ford/` | `#0374D6` on `#051C2C` |
| Evans Halshaw Ford | `evanshalshaw-ford/` | `#00A0DC` on `#0F3456` |
| Allen Motor Group Ford | `allen-motor-group-ford/` | `#2096CD` on `#102B4E` |
| Group 1 Ford | `group1-ford/` | `#00A3E0` on `#243A63` |
| Hendy Ford | `hendy-ford/` | `#56C4B7` on `#1E2E5C` |

Each dealer's palette is taken from that group's own live stylesheet, so the
sites read as genuinely theirs while sharing one structure.

---

## The argument in one file

Open any two sites' `dealer.config.ts` side by side. They are the **only**
meaningful difference between the five builds — everything else is byte-identical.
That file is the Contentful payload at scale.

```
template/
├── app/                  # layout + the single page
├── components/           # one component per benchmark section (Fixed)
├── lib/
│   ├── types.ts          # the DealerConfig contract
│   ├── ford.ts           # FIXED — nav tree, Ford palette, national campaigns, footer legal
│   └── content.ts        # FIXED — builds the six campaign banners + legal notes
├── dealer.config.ts      # FLEXIBLE + FREE — the whole per-dealer surface
└── public/assets/        # Ford oval + official Ford model photography
```

**Fixed** — section order, layout, nav tree, Ford branding, campaign copy, legal
wording. OEM-governed; no dealer can vary it. This is what makes network-wide
search reporting possible.

**Flexible** — dealer name, palette, locations, department phones and hours,
areas served, accreditations, review score.

**Free** — hero strapline, alert-bar offer, the quote panel, promo tile, and the
local welcome paragraph.

That split was derived empirically: the benchmark's Brighton and Reading sites
were diffed to establish exactly which fields real dealers vary and which the
network holds constant.

## Page structure

Thirteen sections, in the benchmark's order, on every site: alert strip →
header with full-screen overlay nav → hero → trust bar → model spotlight →
dual stock locators → news & offers → six alternating campaign banners →
local welcome → about grid → legal notes → tabbed department contact → footer.

## Content updates by AI agent (no CMS at this stage)

The brief specifies an AI agent handling content updates, with no CMS until
stage 2. That is what the config model is for — a content update is a plain-text
edit with a validator and a deterministic pipeline behind it:

1. **Edit** — the agent changes fields in `configs/<site>.ts` ("swap Hendy's
   alert-bar offer", "update Group 1's Saturday service hours"). Copy, imagery,
   hours, phones and theming are all data; no component code is touched.
2. **Validate** — `node check-configs.mjs` rejects missing images, duplicate
   photography, and copy that names a different model than its image shows.
3. **Rebuild** — `./build-sites.sh <site>` re-stamps the affected site;
   `vercel --prod` redeploys it. Nothing else in the network changes.

Because the Fixed layer lives in `template/lib/ford.ts`, a national change (a
new campaign, revised legal copy) is one edit followed by `./build-sites.sh`
with no argument — all five sites pick it up identically. At stage 2 the same
`DealerConfig` shape becomes the Contentful content model, and the agent writes
through the Contentful API instead of to files.

## Running locally

```bash
cd hendy-ford && npm install && npm run dev
```

Or preview all five at once — the dev-server definitions are in
`.claude/launch.json` (ports 3011–3015; the template itself is on 3010).

## Deployed sites

All five run in the **TMW Ford POC** Vercel team, built from this repository.

| Dealer | Live URL | Root Directory |
|---|---|---|
| Lookers Ford | https://lookers-ford-poc.vercel.app | `lookers-ford` |
| Evans Halshaw Ford | https://evanshalshaw-ford-poc.vercel.app | `evanshalshaw-ford` |
| Allen Motor Group Ford | https://allen-motor-group-ford-poc.vercel.app | `allen-motor-group-ford` |
| Group 1 Ford | https://group1-ford-poc.vercel.app | `group1-ford` |
| Hendy Ford | https://hendy-ford-poc.vercel.app | `hendy-ford` |

Repository: `alxdolphinvercel/tmw-ford-dealer-poc` (private).

**How it is wired.** One monorepo, five Vercel projects. Each project is
connected to this same repository and differs only by its **Root Directory** —
the setting that tells Vercel which site folder to build. Push to `main` and all
five deploy; open a pull request and each gets its own preview URL.

Production URLs are public, so PageSpeed Insights and other external tools can
measure them. Preview deployments are SSO-protected to the team, so
work-in-progress stays internal — anyone added to the TMW Ford POC team can see
them, along with build logs, deployment history and instant rollback.

At five sites, one push rebuilding all five is a feature. At 190 it would not be:
production would set an Ignored Build Step per project so a site only rebuilds
when its own directory changes.

To deploy a change:

```bash
./build-sites.sh            # re-stamp sites from template/ + configs/
node check-configs.mjs      # validate content
git commit -am "..." && git push
```

## Working on the template

Edit `template/`, never the generated site directories, then re-stamp:

```bash
./build-sites.sh
```

This wipes and regenerates all five sites from `template/` plus `configs/*.ts`.
Pass a name to do just one (`./build-sites.sh hendy`). Stop any dev server on a
site first — the script refuses to half-stamp a directory it cannot clear.

Then validate the content:

```bash
node check-configs.mjs
```

It checks that every referenced image exists, that no photograph is used twice
on one page, and that the spotlight and hero copy actually name the model shown —
the mistakes that are easy to make when populating one template five times.

## Notes on the build

- **Performance** — fully static, no client data fetching, ~4 kB of interactive
  JS (nav overlay, alert dismiss, contact tabs). All imagery goes through
  `next/image`; scroll reveals are CSS scroll-driven animations, not a JS library.
- **Search** — every department's address, hours and phone is rendered into the
  HTML (hidden tabs use the `hidden` attribute, not conditional rendering) and
  each site emits `AutoDealer` JSON-LD generated from the same config, so the
  structured data cannot drift from the visible page.
- **Accessibility** — skip link, real `<button>`/`<a>` semantics, labelled
  tablist, `aria-expanded` on the menu, focus-visible defaults, and a reveal
  animation that never controls opacity so nothing depends on scroll to be read.
- **Typography** — Ford Antenna is proprietary, so DM Sans and Archivo Narrow
  stand in for Antenna and Antenna Condensed via `next/font`.

## Asset provenance

Vehicle photography is official Ford GB imagery pulled from Ford's own GPAS
image service; showroom, service-bay and parts photographs come from the dealer
groups' public CDNs. The Ford oval is the freely-licensed Wikimedia SVG, with a
reversed variant generated for dark backgrounds.

**This is fine for an internal proof of concept and is not cleared for client-
facing or published use.** For anything beyond the POC, source imagery from
`fordmedia.eu` under press terms or from the client's own asset library.

Copy references real Q3 2026 Ford UK programmes (Ford Power Promise, the
Electric Car Grant, 0% APR Ford Options) and each dealer's genuine locations,
phone numbers and accreditations. Review scores appear only where the dealer
actually publishes one on its Ford pages — Evans Halshaw is the only group in
this set that does, so the others lead on accreditations instead of an invented
star rating. Offer terms are illustrative and would need legal sign-off.

## Brief compliance

| Brief requirement | Status |
|---|---|
| Up to 6 pilot dealer pages from a single Next.js template | ✅ 5 pages, one template, stamped by script |
| Next.js framework, hosted on Vercel | ✅ Next.js 16, fully static; **live on Vercel** in the TMW Ford POC team, git-deployed from this repo |
| AI agent handles content updates — no CMS required | ✅ config-file workflow above; validated, rebuilt and deployed by `git push` |
| Fixed / Flexible / Free baked into the template structure | ✅ Fixed in `lib/ford.ts` + components; Flexible/Free in `dealer.config.ts` — split derived by diffing the benchmark's Brighton vs Reading sites |
| Built for the full vision, not just the POC | ✅ `DealerConfig` is the future Contentful content model; national content is single-sourced |
| The 4 specified dealer links + benchmark structure | ✅ all four dealers built (plus Hendy as the 5th), 13 sections mirroring group1brightonbmw.co.uk |
| POC cost / two-week timeline / >190-site Vercel + Contentful scale cost | ⬜ commercial figures for the account team — deliberately not estimated here |

## Still to provide

The brief also asks for proof-of-concept cost, timeline to working demo, and
indicative Vercel + Contentful hosting cost at 190 sites. Those are commercial
figures for the account team — deliberately not estimated here.

