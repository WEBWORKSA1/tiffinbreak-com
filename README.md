# TiffinBreak.com

An independent tiffin hub with three jobs:

1. **Find a tiffin** – a matching service that turns visitors into qualified leads for home-style tiffin kitchens (the money engine).
2. **Pack a tiffin** – recipes, a weekly tiffin planner and safety/cost tools (the traffic engine, monetised with Google AdSense).
3. **Start a tiffin kitchen** – a business calculator, licensing guides by country and a kitchen-listing funnel (supply-side leads and listings).

It also carries sponsorship/advertising, donations, a monthly skill challenge with prizes, careers, and a YouTube video library.

Live preview (GitHub Pages): `https://webworksa1.github.io/tiffinbreak-com/`

## How the site is built
Plain Jekyll, built by GitHub Pages itself (free plan, branch `main`, folder `/ (root)`). No Actions, servers or databases are required.

| Path | What it is |
|---|---|
| `_config.yml` | Site settings: URL, base path, AdSense client, owner-contact link |
| `_layouts/` | `default` (shell with owner bar, header, footer, AdSense, cookie notice, JSON-LD), `recipe`, `city`, `guide` |
| `_includes/` | Header, footer, lead form, newsletter, support strip, video card |
| `_data/*.json` | Recipes, city guides, videos, challenge themes, seasons, jobs, ad packages, news |
| `recipes/`, `cities/`, `guides/`, `tools/` | Pages. Recipe and city pages are tiny stubs; their content comes from `_data` |
| `assets/js/config.js` | **Edit me:** payment links, prizes, form relay key, listing prices |
| `assets/js/main.js` · `tools.js` · `planner.js` | UI, forms, lead scoring, search, countdowns · calculators · weekly planner |
| `automation/` | Optional daily refresh workflow + news script (see below) |
| `PROMPTS.md` · `RESEARCH.md` | Phase-wise build prompts · competitor and market research (not published) |

**Add a recipe:** append an object to `_data/recipes.json`, then create `recipes/<slug>.html` with front matter `layout: recipe`, `slug`, `title`, `description`.
**Add a city:** append to `_data/cities.json`, then create `cities/<slug>.html` the same way with `layout: city`.

## Publish on GitHub Pages (one-time)
Settings → Pages → Build and deployment → Source **Deploy from a branch** → Branch **main**, folder **/ (root)** → Save. The site goes live at the preview URL above within a few minutes.

## Custom domain (TiffinBreak.com) – needed for AdSense approval
1. DNS at your registrar: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; CNAME `www` → `webworksa1.github.io`.
2. Settings → Pages → Custom domain `tiffinbreak.com` → Save, then tick **Enforce HTTPS**.
3. In `_config.yml` set `url: "https://tiffinbreak.com"` and `baseurl: ""`, then commit.

## Forms (lead gen, office quotes, kitchen listings, contact, pledges, challenge entries, careers, partners, newsletter)
All forms post through FormSubmit to the owner inbox. The address is assembled at runtime from the encoded `relay` key in `assets/js/config.js` and never appears in page source or page text.
- **The first submission triggers a one-time FormSubmit activation email. Click Activate**, or later submissions are not delivered.
- After activation FormSubmit shows a random alias string. Paste it into `formAlias` in `config.js` to stop using the encoded address at all.
- Lead submissions include a 0–100 lead score, first landing page, referrer and UTM tags.

## Donations
Paste PayPal.me / Stripe Payment Link / Buy Me a Coffee / Ko-fi / Razorpay / UPI URLs into `assets/js/config.js` → `payments`. Until then the Support page runs in pledge mode: the pledge comes to you and you reply with a payment link.

## AdSense
- The tag for `ca-pub-6620975821265271` is in the `<head>` of every content page, plus the `google-adsense-account` meta tag on every page. The tag is deliberately left off the three lead funnels (`find.html`, `office.html`, `list-your-kitchen.html`), `thank-you.html` and `404.html` so ads never sit inside a conversion flow.
- `ads.txt` is at the root. AdSense only approves sites on a domain you own, so apply after the custom domain is live and `https://tiffinbreak.com/ads.txt` resolves.
- After approval: enable Auto ads, and turn on the Google-certified consent message for EEA/UK/CH under Privacy & messaging.

## Daily automation (optional, one-time)
Copy `automation/auto-update.yml` to `.github/workflows/auto-update.yml` (Add file → Create new file). Each day it refreshes `_data/news.json` from Google News RSS and commits it; Pages then rebuilds, which also rolls the "Updated" dates. Everything else (tiffin of the day, seasonal picks, challenge theme and countdown) already updates itself in the browser.

## Trademark / copyright
See `disclaimer.html`. "TiffinBreak" is used as the descriptive name of this website and domain. The site claims no affiliation with any restaurant, caterer, tiffin service or brand using "Tiffin", "Tiffin Break" or similar names, uses no third-party logos, and embeds YouTube videos only through YouTube's own player.
