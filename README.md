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

The brief asks for an AI agent to handle content updates with no CMS. That is
built: **`content-agent/`** — the *Ford Dealer Content Agent*, a sixth Vercel
project in the TMW Ford POC team.

An operator picks a target, types an instruction in plain English, and watches
the agent work: read → propose → validate → commit → preview. The output is a
**pull request** with a per-field diff and a live preview URL. Nothing reaches a
live site until a person merges.

```
Instruction:  "Saturday service hours are now 08:30 – 13:00"
      ↓
  reading      configs/hendy-ford.ts
  proposing    considering 181 editable fields
  validating   checking 2 proposed edit(s)
  diff         location.departments.1.hours.1.time   08:30 – 12:30 → 08:30 – 13:00
  committing   pull request #12 opened
  previewing   1/1 preview ready → https://hendy-ford-…vercel.app
```

### Why it is safe to let an agent do this

**The model never writes TypeScript.** It returns field *paths* and replacement
*text*; `lib/edit.ts` locates the exact string-literal node with the TypeScript
compiler API and splices the new value in by character offset. Generation
therefore cannot introduce a syntax error, drop a field, or reformat the file —
the three ways an LLM rewriting a config normally breaks a build.

**The agent can only touch content.** `lib/targets.ts` is an allowlist of
editable paths. Anything else — page structure, navigation, legal boilerplate,
component code — is refused, and the refusal is shown to the operator. Ask it to
add a section or edit the nav and it declines with a reason.

**Every change is a reviewable PR**, so the audit trail, approval gate, preview
and rollback all come from GitHub and Vercel rather than from a CMS.

### One instruction, all five sites

Selecting *All five sites — Ford national content* targets
`template/lib/ford.ts`. Because the site directories hold copies stamped by
`build-sites.sh`, the agent mirrors each edit into every copy — so a national
change writes 6 files, opens 1 PR, and rebuilds all five sites. At 190 sites it
is the same single instruction.

### What it can change

| Layer | Fields |
|---|---|
| Free | Alert bar, hero headline and strapline, promo tile, staff quote, welcome paragraph, page title and meta description |
| Flexible | Phone numbers, opening hours per department, address, areas served, accreditations |
| Theming | Accent and dark-band colours |
| National | Ford campaign headings and body copy (`FORD_CAMPAIGNS`) |

### Running and configuring it

```bash
cd content-agent && vercel env pull .env.local && npm run dev
```

Secrets: **one** — `GITHUB_TOKEN`, for opening pull requests. The model is
reached through **AI Gateway using OIDC**, so there is no AI key, and preview
URLs are read from GitHub's own deployments API, so there is no Vercel token
either.

Access is restricted to the TMW Ford POC team by Vercel SSO on all deployment
URLs, since the console can write to the repository.

### Limits worth stating plainly

Structural validation catches malformed edits, **not false statements**. The
agent is instructed never to invent prices, APR figures or dates, but it can
still produce copy that is wrong. Finance and offer terms are FCA-regulated, so
the pull-request review is a compliance requirement, not a convenience. The UI
says so on every screen.

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

Plus the content agent, team-only:

| Tool | URL | Root Directory |
|---|---|---|
| Ford Dealer Content Agent | https://content-agent-tmw-ford-poc.vercel.app | `content-agent` |

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
| AI agent handles content updates — no CMS required | ✅ **Ford Dealer Content Agent** (`content-agent/`) — natural-language instruction → validated edit → pull request → preview URL |
| Fixed / Flexible / Free baked into the template structure | ✅ Fixed in `lib/ford.ts` + components; Flexible/Free in `dealer.config.ts` — split derived by diffing the benchmark's Brighton vs Reading sites |
| Built for the full vision, not just the POC | ✅ `DealerConfig` is the future Contentful content model; national content is single-sourced |
| The 4 specified dealer links + benchmark structure | ✅ all four dealers built (plus Hendy as the 5th), 13 sections mirroring group1brightonbmw.co.uk |
| POC cost / two-week timeline / >190-site Vercel + Contentful scale cost | ⬜ commercial figures for the account team — deliberately not estimated here |

## Still to provide

The brief also asks for proof-of-concept cost, timeline to working demo, and
indicative Vercel + Contentful hosting cost at 190 sites. Those are commercial
figures for the account team — deliberately not estimated here.

