# STEP IN Recruitment — Next.js

A faithful Next.js port of the STEP IN Recruitment WordPress/Elementor site, ready for Vercel.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```

## One-time step: client logos
Six logo SVGs used in the home page logo carousel are loaded lazily and weren't in the export.
While the WordPress staging site is still online, run:
```bash
node scripts/fetch-missing-logos.mjs
```
Then commit the files it adds under `public/uploads/2026/09/`.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo (framework auto-detects as Next.js).
3. Add environment variables (Settings → Environment Variables) so the forms send email:
   - `RESEND_API_KEY` — from resend.com (free tier is fine)
   - `FORM_TO_EMAIL` — where enquiries go, e.g. `tara@stepinrecruitment.com.au`
   - `FORM_FROM_EMAIL` — a sender on a domain verified in Resend, e.g. `STEP IN Website <noreply@stepinrecruitment.com.au>`
   - `NEXT_PUBLIC_SITE_URL` — final site URL (used for canonical links)

## Structure
| Path | What it is |
|---|---|
| `app/[[...slug]]/page.tsx` | Renders every page (statically generated at build) |
| `app/api/forms/route.ts` | Replaces WordPress `admin-ajax.php` for the Elementor forms; emails via Resend |
| `components/` | Shared `SiteHeader`, `SiteFooter` (2 variants), `Popups` |
| `content/pages/*.html` | Main content of each page |
| `content/partials/` | Header, footers, popups markup |
| `content/site.json` | Page titles, body classes, footer variant per page |
| `content/forms.json` | Form field labels used in notification emails |
| `public/css/site.css` | All theme + Elementor CSS, bundled in original order |
| `public/js/` | jQuery, Elementor runtime bundle, `stepin.js` (active menu + search) |
| `public/uploads/` | Media library (large PNG/JPGs converted to WebP) |

## Notes
- Pages: Home, About, Services, Industries, Why STEP IN, Testimonials, Your Next Step, Your Next Step 3, Build Your Team, Contact Us, Sample Page. Remove `your-next-step-3` / `sample-page` from `content/site.json` if they're not wanted.
- The JobAdder job widget loads from `apps.jobadder.com` as before.
- Search sends queries to a site-restricted Google search (there is no WordPress search backend).
- To edit copy, change the HTML in `content/pages/` or `content/partials/`.
