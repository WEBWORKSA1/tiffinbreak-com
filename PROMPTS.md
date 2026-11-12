# TiffinBreak.com: phase-wise build prompts

Copy each phase into your AI builder in order. Each phase assumes the previous one is done. The live repo already implements Phases 0 to 7; Phase 8 is the growth roadmap.

---

## Phase 0: Brief and guardrails

> You are building **TiffinBreak.com**, an independent tiffin hub with three jobs: (1) **Find a tiffin**: match customers with home-style tiffin kitchens (the money engine: kitchens pay per lead and for listings); (2) **Pack a tiffin**: recipes written for the tin, a weekly planner, cost and safety tools (the traffic engine, monetised with Google AdSense `ca-pub-6620975821265271`); (3) **Start a tiffin kitchen**: business calculator, licensing by country, kitchen listings.
>
> Hard rules:
> - Static site only, hosted free on GitHub Pages from `main` (Jekyll is allowed; no servers, no paid services).
> - On top of every page, a full-width bar linking to `https://web.works/contact` with the text: "Contact, if you are interested in this website / domain name / sponsorship / advertisement / partnership".
> - Every form posts to the single owner inbox through FormSubmit. The address must never appear in HTML, text or links: store it reversed and base64-encoded in `assets/js/config.js` and assemble it at runtime. Support a `formAlias` override for FormSubmit's random alias.
> - AdSense tag in the `<head>` of every content page; omit it on lead funnels, thank-you and 404. Add `ads.txt` and the `google-adsense-account` meta tag.
> - Original content only. No third-party logos, no copied recipes, YouTube only through YouTube's player. Add a trademark and copyright disclosure: "tiffin" and "tiffin break" used descriptively; no affiliation with any business using similar names.
> - Never invent kitchens, reviews or ratings. City prices are labelled indicative.

## Phase 1: Foundation and design system

> Create the Jekyll skeleton: `_config.yml` (url, baseurl for the github.io preview, `jekyll-sitemap`), `_layouts/default.html` (owner bar, sticky header, breadcrumbs from `section`/`section_url` front matter, footer with newsletter and legal links, cookie notice, Organization + WebSite + BreadcrumbList JSON-LD), `_includes` for header, footer, video card, recipe card, diet mark, CTA strip.
>
> Visual identity, taken from the subject: brushed stainless steel (cool steel-grey background `#F2F5F4`, ink `#1D2B2F`), haldi/turmeric `#E9A316`, mirchi/chilli `#B8321C` for the main call to action, kadi-patta/curry-leaf `#2E6A3E`. Display type Rozha One, body Mukta (Indian Type Foundry families). Signature hero: a stacked three-tier tiffin carrier built in CSS where each tier is a link (EAT: find a tiffin, PACK: recipes and planner, COOK: start a kitchen), with one page-load stacking animation and reduced-motion respected. Recipe cards show a CSS "open tin from above" illustration coloured per dish. Use the Indian veg/non-veg square-and-symbol marks as real diet labels. City codes in a painted dabba-code style (BRM/ON). Pill buttons, no generic card shadows, sentence case, responsive to 360 px, visible focus states.

## Phase 2: Lead engine

> Build `find.html`: a four-step form (where, what you eat, budget and timing, contact) with progress bar, per-step validation, URL prefill (`?city=&diet=`), consent to share with up to three kitchens, and redirect to `thank-you.html?f=match`. Build `office.html` (company, headcount, frequency, diet mix, budget per meal, start) and `list-your-kitchen.html` (areas, cuisines, diets, capacity, registration status, plan interest, with Free / Matched leads / Featured / Spotlight plans whose prices come from `config.js`).
>
> In `main.js`: capture first landing page, referrer and UTM tags in localStorage; compute a 0 to 100 lead score per form type (start date, budget, phone, meals, people, headcount, frequency, licence, capacity); add `_subject` with the score, `_template: table`, `_replyto`, honeypot; POST JSON to the FormSubmit AJAX endpoint; inline success messages for non-funnel forms. Add a home-page quick-match bar that hands off to `find.html`, a mobile sticky "Find a tiffin" bar, and a CTA strip on content pages.

## Phase 3: Content engine

> Recipes as data (`_data/recipes.json`): slug, title, description, diet (veg, vegan, jain, egg, nonveg), cuisine, audience (kids, office), time, tiffins served, how long it keeps ("4 hrs cold", "5 hrs hot"), dish colour, ingredients as [qty, unit, item], steps, packing note, swaps. A `recipe` layout renders hero, facts, ingredient scaler, method, packing and swap notes, a related video, related recipes and Recipe JSON-LD. Recipe pages are tiny stubs with front matter. Start with 20+ recipes across South Indian, Punjabi, Gujarati, Maharashtrian, Indo-Chinese, Jain, egg and non-veg.
>
> Cities as data (`_data/cities.json`): code, intro, scene, neighbourhoods, cuisines, indicative price, local tip, regulator name, URL and note. A `city` layout with an embedded match form. Start with the highest-value diaspora cities (Brampton, Mississauga, Toronto, Montréal, Surrey, Calgary, New York, Edison/Jersey City, Bay Area, London, Leicester, Melbourne, Mumbai, Bengaluru). Each page must be genuinely different, never a template with the city name swapped.
>
> Guides in Markdown with sources: how to choose a tiffin service, how to start a tiffin business (registration table by country), tiffin food safety, history of the tiffin and the dabbawalas, kids' tiffin ideas, tiffin vs meal kits, how to choose a tiffin box. Video library from `_data/videos.json` with click-to-play YouTube facades (youtube-nocookie).

## Phase 4: Tools

> Weekly planner: diet, audience, days, tiffins per day, max time; fills days without repeats, lock and swap per day, combined scaled shopping list, copy and print, saved in localStorage, `?add=slug` from recipe pages. Cost calculator: cook vs tiffin plan vs takeout per month with time priced in, currency presets. Business calculator: price, subscribers, food, packaging, commission, delivery, fixed costs and hours to monthly profit, margin, food-cost share, profit per hour and break-even subscribers, feeding a "starter kit" lead form. Safety checker: packed time, eating time, contents, packing method and conditions mapped to the USDA two-hour rule with conservative allowances for insulated tins and two ice packs.

## Phase 5: Monetisation and community

> AdSense Auto ads on content pages only. `advertise.html` with packages from `_data/packages.json` and a media-kit form, plus a direct owner link for website/domain enquiries. `support.html` with tiers, payment links from `config.js` (PayPal, Stripe, Buy Me a Coffee, Ko-fi, Razorpay, UPI) and pledge mode when none are set; say clearly that support is not tax-deductible. `challenge.html`: monthly theme from `_data/themes.json`, automatic countdown to month end, prizes from config, entry form, judging criteria and full official rules (skill contest, 18+, no purchase, skill-testing question for Canadian winners, prizes not allocated by region). `careers.html` with roles from `_data/jobs.json` and an application form.

## Phase 6: Automation and self-updating

> Tiffin of the day (rotates by day of year from `assets/data/recipes.json`), seasonal picks and challenge theme by month, contest countdown, search index generated by Jekyll (`search.json`) with a client-side search page, "updated" dates from build time, and an optional GitHub Actions workflow that refreshes `_data/news.json` from Google News RSS daily and requests a Pages rebuild.

## Phase 7: Compliance, QA and launch

> Pages: about, contact (form only), privacy (forms, FormSubmit, lead sharing, cookies, AdSense third-party vendor wording and opt-out links, YouTube, Google Fonts, rights, children), terms (kitchens are independent; information not advice; governing law Québec), trademark/copyright disclaimer, editorial policy (including use of AI drafting tools), FAQ with FAQPage schema, thank-you (noindex), 404. Checks: no email anywhere in built output; every page has the owner bar; AdSense only where intended; all JSON-LD parses; no horizontal scroll at 390 px; forms validate and submit; Lighthouse accessibility pass. Launch: enable GitHub Pages from `main`, point TiffinBreak.com DNS to GitHub Pages, set `url`/`baseurl`, enforce HTTPS, submit the sitemap to Search Console, then apply to AdSense and enable Google's consent message for EEA/UK.

## Phase 8: Growth roadmap (next 90 days)

> 1. Sign 10 to 20 GTA and Montréal kitchens on matched-lead plans before buying traffic; route every lead within 4 hours.
> 2. Add a public kitchen directory per city once there are real, consenting kitchens (with registration status shown).
> 3. Publish two recipes and one guide a week; target long-tail searches such as "Jain tiffin service Brampton" and "tiffin service near me price".
> 4. French versions of the Montréal guide and the find form; Hindi and Gujarati recipe pages later.
> 5. Start a TiffinBreak YouTube channel: one 60-second "packed at 8, opened at 1" test per recipe.
> 6. Run Google Ads on "tiffin service + city" once cost per lead is below half the lead price.
> 7. Sell the challenge title sponsorship to a lunchbox or grocery brand each month.
