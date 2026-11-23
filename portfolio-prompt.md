# PROMPT — Build a personal AI/Data portfolio website (paste this whole file into your AI coding tool)

You are a senior front-end engineer and designer. Build a complete, production-ready **personal portfolio website** for a Computer Science / Data Science / AI student or junior engineer. The site is a **static site** (no build step, no framework, no backend) that can be deployed as-is to Vercel, Netlify or GitHub Pages.

Work in this order: (1) read the whole brief, (2) propose the file tree in one short message, (3) build all files, (4) run a self-check against the "Acceptance checklist" at the bottom, (5) fix anything that fails, (6) give me a short README with deploy steps.

---

## 0. The one rule that matters most: NO personal data baked into code

- Do **not** invent a real person, a real name, real companies, real GPA, real links, phone numbers or emails.
- Every piece of personal content lives in **one single file:** **`data.js`** (exposes `window.SITE_DATA = {...}`). HTML/JS/CSS must contain **zero** hard-coded personal strings (name, bio, links, email, project names, dates, metrics, SEO text).
    - Use `data.js` (not `fetch("data.json")`) so the site also works when opened by double-clicking `index.html` (`file://`).
- If I have not supplied a value (see Section 12 "MY DATA"), fill it with an obvious placeholder such as `Your Name`, `you@example.com`, `https://github.com/your-username`, `Project Title`, `Lorem-style one-liner…` and **hide any section/link whose data is empty** (e.g. no LinkedIn → no LinkedIn icon; no blog posts → no Blog section and no nav item; no demo URL → no "Live demo" button).
- Page `<title>`, meta description, Open Graph/Twitter tags, JSON-LD and canonical URL must be **generated at runtime from** **`data.js`** AND have sensible static placeholder fallbacks in the HTML (so crawlers that don't run JS still see something). Put a comment `<!-- REPLACE: ... -->` next to every static fallback that needs a manual edit.
- `sitemap.xml`, `robots.txt` use a `https://YOUR-DOMAIN.example` placeholder.

---

## 1. Tech constraints

- Plain **HTML5 + CSS3 + vanilla ES2020 JavaScript**. No React, no Tailwind, no bundler, no npm dependencies.
- Only external resources allowed: Google Fonts (preconnect + `display=swap`). No analytics, no trackers, no CDNs for JS.
- Works in latest Chrome, Safari, Firefox, Edge; 320px → 2560px wide.
- Lighthouse targets: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Total JS \< 60 KB unminified, total CSS \< 70 KB unminified. No images required to render the site (use CSS/SVG/canvas). Profile photo is optional (see data).

## 2. File structure

```
/index.html               single-page home (all main sections)
/projects/index.html      full projects archive page (search + filters + sort)
/blog/index.html          full blog archive (only linked if posts exist)
/blog/_template.html      article template (blog posts are plain HTML files copied from this)
/css/tokens.css           design tokens only (colors, type, spacing, radii, shadows) — light + dark
/css/base.css             reset, typography, layout primitives, utilities
/css/components.css       nav, buttons, cards, chips, timeline, modal, command palette, toast…
/js/data-loader.js        reads window.SITE_DATA, validates shape, applies defaults, hides empty sections
/js/render.js             renders every section from data
/js/ui.js                 theme toggle, nav, scroll-spy, command palette, toast, copy-to-clipboard, reveal-on-scroll
/js/i18n.js               language switch (see §6)
/js/hero-visual.js        the hero animation (see §5)
/data.js                  ALL personal content (see §10 for schema)
/assets/                  og-image.png placeholder, optional avatar placeholder, favicon.svg
/cv/                      empty folder with a README: "put your CV PDF here and set data.cv.file"
/sitemap.xml  /robots.txt  /README.md  /.gitignore
```

Do **not** create an admin dashboard, login page, `env.js`, or anything that stores credentials/tokens in the client. Content is edited by editing `data.js`. (Client-side "login" is not real security and leaks secrets.)

## 3. Visual direction (must be clearly different from a generic template)

Aesthetic: **"calm technical editorial"** — lots of whitespace, a strong typographic hierarchy, thin 1px borders, very quiet shadows, one accent color. Feels like a well-made engineering blog + a product landing page. No neon glows, no purple-to-blue gradient hero, no glassmorphism overload, no emoji icons, no stock illustrations.

- **Accent color:** a single accent, configurable in `data.theme.accent` (default **emerald/teal** **`#0f9d8a`** **light /** **`#2dd4bf`** **dark**). Derive hover/soft-background shades with `color-mix()` in CSS.
- **Fonts (default):** headings `Fraunces` or `Instrument Serif` (a refined serif for large display text), body `Inter` or `Geist`, code/labels `IBM Plex Mono`. Fonts are configurable via CSS variables in `tokens.css`.
- **Neutrals:** warm off-white background in light mode (`#faf9f6`-ish), near-black graphite in dark mode (`#0e0f11`-ish). Respect `prefers-color-scheme` on first visit, then remember the user's choice in `localStorage` (wrapped in try/catch).
- **Layout:** 12-column grid, max content width 1120px, generous vertical rhythm (section padding `clamp(64px, 10vw, 128px)`).
- **Section style:** each section opens with a small mono "index label" (`01 — About`, `02 — Skills`…) + a large serif title. Section numbers are generated automatically from the visible sections.
- Use **fluid type** with `clamp()` for h1/h2/h3.
- Use CSS `:focus-visible` rings, `prefers-reduced-motion` guards on **every** animation, and `color-scheme` meta.
- Icons: a small inline SVG sprite (github, linkedin, mail, phone, map-pin, external-link, download, copy, sun, moon, search, arrow-right, globe, x/twitter, youtube, kaggle, medium) — hand-written, 24×24, stroke 1.75, `currentColor`.

## 4. Sections of `index.html` (all rendered from data, each can be turned off)

1. **Nav** — sticky, blurred-solid background after scroll, logo = initials monogram + first name, links generated from visible sections, theme toggle, language toggle (if enabled), "Contact" CTA, mobile drawer with focus trap and `Esc` to close. Scroll-progress hairline at the top.
2. **Hero** — availability pill (text + on/off from data), name, one-line role, 2–3 sentence bio, primary + secondary CTA (View projects / Download CV), small **"at a glance" stats row** (3 items from data), social icon row, and the hero visual on the right (§5).
3. **About** — 2 paragraphs (HTML allowed in data, sanitized: only `strong, em, a, br, code`), plus a **"Currently"** card with 3 short bullets (`Building`, `Learning`, `Reading`) and an optional photo (circular crop, grayscale→color on hover; hidden if no photo).
4. **Focus areas** — 3–4 cards (title, one-liner, small icon) describing what the person specializes in.
5. **Skills** — grouped tag clusters (6 groups max) with a **filter-as-you-type** input that dims non-matching tags. Below it, a "Currently learning" strip.
6. **Projects** — featured projects (cards): title, one-liner, 3 highlight bullets, tech chips, status badge (Completed / In progress / Archived), links (GitHub, Live demo, Case study). Controls: search box, category pills built from the data, "Featured / Newest" sort. Show 6 on home + "View all projects →" to `/projects/`. **Clicking a card opens an accessible modal** (focus trap, `Esc`, return focus) with the long description, role, timeline, problem → approach → result, and all links.
7. **Research / Interests** — 3 cards (title, status badge, short text) + an optional collaboration call-to-action box. Hidden if empty.
8. **Experience \& Education** — a **two-column timeline** (Experience left, Education + Courses/Certificates right on desktop; stacked on mobile). Each item: title, organization, period, badges, 2–4 bullets. Items marked `current: true` get a subtle live dot.
9. **Writing** (blog) — latest 3 posts as list rows (date · title · category · reading time) + "All posts →". Hidden if no posts.
10. **Contact** — short intro, contact items (email with copy button, GitHub, LinkedIn, phone, location — each optional), and a **contact form that works without a backend**: on submit it builds a `mailto:` link to `data.profile.email` (subject + body URL-encoded) and also offers a "Copy message" button. If `data.contact.formEndpoint` is set (Formspree/Web3Forms-style URL), POST JSON there with `fetch` instead, with loading/success/error states. Include a hidden honeypot field.
11. **Footer** — name, copyright year (auto), nav links, social icons, "Back to top".

## 5. Hero visual (do NOT reuse a "mascot orb with particles")

Create a **live "agent trace" terminal card**: a rounded card styled as a minimal terminal/IDE panel that types out and loops 3–4 short, fake-but-plausible log lines built from the person's skills in `data.js` (e.g. `→ retrieve(top_k=5)`, `→ rerank(model="cross-encoder")`, `✓ answer grounded (3 sources)`), with a blinking caret and a tiny animated "thinking" progress bar. Lines come from `data.hero.traceLines` (array of strings) with generic defaults. Respect `prefers-reduced-motion` (show the final static state). Below 640px, shrink to a compact version. It must be a self-contained canvas-free DOM component (no libraries).

## 6. Internationalization (English + Arabic, optional)

- `data.i18n.enabled` (bool) and `data.i18n.languages` (`["en","ar"]`).
- When enabled: a language switch in the nav; every user-facing string in `data.js` can be either a string or `{ en: "...", ar: "..." }`. UI labels (nav, buttons, section titles) live in a `UI_STRINGS` object in `i18n.js` with both languages.
- Arabic mode flips to `dir="rtl"`, uses `Tajawal` (body) and `Cairo` (headings), uses CSS logical properties everywhere (`margin-inline-start`, `padding-inline`, `inset-inline-end`…) so RTL needs **no** duplicate CSS. Remember the choice in `localStorage` and set `<html lang dir>`.
- If a field has no Arabic value, fall back to English.

## 7. Interaction features

- **Command palette** (`Ctrl/⌘ + K` and a "Search" button): fuzzy search across sections, projects, blog posts and quick actions (copy email, toggle theme, switch language, open GitHub, download CV). Arrow keys + Enter + Esc, `role="dialog"`, `aria-activedescendant`.
- **Scroll-spy** with IntersectionObserver for the active nav link.
- **Reveal-on-scroll** (opacity + 12px translate, one-time, disabled for reduced motion).
- **Toast** for copy actions.
- **Keyboard shortcuts:** `g` then `p` = projects, `g` then `c` = contact, `t` = toggle theme (ignored when typing in inputs). Show them in the palette footer.
- **Print stylesheet:** `@media print` makes the home page a clean one-page résumé-style layout (hide nav, hero visual, forms).

## 8. Archive pages

- `/projects/index.html`: grid of **all** projects, search, category pills, tech-chip multi-filter, sort (Featured / Newest / A–Z), result count with `aria-live="polite"`, empty state, and the same modal. Syncs filters to the URL query string (`?q=&cat=`).
- `/blog/index.html`: list of posts with search + category pills + empty state.
- `/blog/_template.html`: a clean article layout (title, meta row, TOC auto-generated from `h2/h3`, reading progress bar, code blocks with a **copy** button, callout component, previous/next links, "back to blog"). If i18n is enabled, support two `<section data-lang="en|ar">` blocks in one file with a language switch.

## 9. SEO, accessibility, performance (non-negotiable)

- Semantic landmarks (`header, nav, main, section[aria-labelledby], footer`), one `h1` per page, skip-to-content link.
- All interactive elements keyboard reachable, visible focus, 44×44px minimum touch targets, contrast ≥ 4.5:1 in both themes (verify the accent on both backgrounds).
- `lang` + `dir` correct; `meta theme-color` for light/dark; SVG favicon generated from the initials.
- JSON-LD `Person` + `WebSite` built from data (omit empty `sameAs` entries).
- `rel="noopener noreferrer"` on every external link; no inline event handlers (`onclick=`) — use `addEventListener`.
- Sanitize any HTML coming from data (allowlist) — never `innerHTML` raw user strings.
- No layout shift: reserve space for the hero visual; fonts with `font-display: swap`; `loading="lazy"` + width/height on any image.
- `localStorage`/`matchMedia` access wrapped in try/catch.

## 10. `data.js` schema (create it with realistic **placeholder** values and a comment above every block explaining it)

```
window.SITE_DATA = {
  site:   { url: "https://YOUR-DOMAIN.example", language: "en", ogImage: "/assets/og-image.png" },
  theme:  { accent: "#0f9d8a", accentDark: "#2dd4bf", defaultMode: "system" /* system|light|dark */ },
  i18n:   { enabled: false, languages: ["en"] },
  profile:{ name: "Your Name", initials: "YN", role: "AI / Data Science Student",
            tagline: "One sentence about what you build.", bio: "2–3 sentences…",
            aboutHtml: ["<p>…</p>", "<p>…</p>"], photo: "", location: "City, Country",
            availability: { show: true, text: "Open to internships" },
            email: "you@example.com", phone: "" },
  links:  { github: "", linkedin: "", twitter: "", kaggle: "", medium: "", youtube: "", website: "" },
  cv:     { file: "", label: "Download CV" },
  hero:   { stats: [ {value:"", label:""}, {value:"", label:""}, {value:"", label:""} ],
            traceLines: [] },
  now:    { building: "", learning: "", reading: "" },
  focusAreas: [ { icon: "cpu", title: "", text: "" } ],
  skills: { groups: [ { title: "", items: ["", ""] } ], learning: [""] },
  projects: [ { id: "slug", title: "", summary: "", description: "", category: "",
                status: "Completed", featured: true, date: "YYYY-MM", role: "",
                highlights: ["","",""], tech: ["",""],
                problem: "", approach: "", result: "",
                links: { github: "", demo: "", caseStudy: "" } } ],
  research: { items: [ { title: "", status: "Active focus", text: "" } ],
              cta: { title: "", text: "" } },
  experience: [ { title: "", org: "", period: "", current: false, badges: [""], bullets: ["",""] } ],
  education:  [ { title: "", org: "", period: "", badges: [""], bullets: ["",""] } ],
  courses:    [ { title: "", org: "", period: "", link: "" } ],
  blog:   [ { title: "", date: "YYYY-MM-DD", category: "", tags: [""], readingTime: "", summary: "", link: "blog/your-post.html" } ],
  contact:{ intro: "", formEndpoint: "", responseTime: "" },
  footer: { text: "" }
};
```

Add a tiny **validator** in `data-loader.js` that logs readable `console.warn`s for missing/misspelled keys (never throws) and strips empty items.

## 11. Things to do differently on purpose (so the result is not a clone of any existing portfolio)

- Serif display typography + warm neutrals + emerald accent (not a cold slate + cobalt look).
- Terminal "agent trace" hero instead of a mascot/particle hero.
- Numbered section labels, a "Currently" card, focus-area cards, project **modal with problem → approach → result**.
- Two-column Experience/Education timeline.
- Full EN/AR toggle across the whole site (not just one article).
- Single-source-of-truth `data.js` (works offline), no admin panel, no credentials, no `env.js`.
- URL-synced filters, keyboard shortcuts, print stylesheet.

## 12. MY DATA (the user fills this block before sending — anything left empty becomes a placeholder and the related UI is hidden)

```
NAME: Amr Etman
INITIALS: AE
```

ROLE / TITLE: Data Engineering Student \| Computer Science

ONE-LINE TAGLINE:\
Building reliable data pipelines and turning raw data into useful insights.

SHORT BIO:\
I'm a Computer Science student interested in Data Engineering, data processing, and building practical data solutions. I work with Python, SQL, and data tools to clean, transform, and organize data, while continuously exploring modern data engineering technologies and workflows.

ABOUT:\
I'm a Computer Science student at the Faculty of Computers and Data Science, Alexandria University, with a growing interest in Data Engineering and the infrastructure behind data-driven applications. I've worked with Python, SQL, data cleaning, analytical workflows, and database design, and I'm developing my understanding of building reliable and structured data pipelines.

I enjoy learning by building projects and experimenting with tools across the data ecosystem. My goal is to grow into a Data Engineer capable of designing, building, and maintaining scalable data workflows, from ingestion and transformation to storage and analytics.

LOCATION: Egypt\
AVAILABILITY TEXT: Open to Data Engineering Internships

EMAIL: [amretman1213@gmail.com](mailto:amretman1213@gmail.com)\
PHONE:

LINKS:\
GitHub: [https://github.com/amretman77](https://github.com/amretman77)\
LinkedIn: [https://www.linkedin.com/in/amr-etman-71ba963a6/](https://www.linkedin.com/in/amr-etman-71ba963a6/)\
X:\
Medium:\
Personal site:

PHOTO: none\
CV PDF: Already placed in /cv folder (filename to confirm)

3 HERO STATS:\
88% — Training Score\
120 Hours — Training\
3.05 — GPA

CURRENTLY:\
Building data processing and ETL workflows using Python, SQL, and relational databases. Exploring Apache Airflow, Spark, Kafka, Hadoop, and modern data pipeline architecture.

FOCUS AREAS:

- Data Pipelines — Building structured ETL workflows for data ingestion, transformation, and loading.
- Data Processing — Cleaning, validating, and transforming raw datasets using Python and Pandas.
- SQL \& Databases — Working with relational databases, SQL queries, data modeling, and analytical workflows.
- Big Data Technologies — Exploring distributed data processing and tools such as Spark, Hadoop, Kafka, and Airflow.

SKILL GROUPS:\
Programming \& Data Processing → Python, Pandas, NumPy\
Databases \& SQL → MySQL, PostgreSQL, SQL, Database Design\
Data Engineering → ETL Pipelines, Data Cleaning, Data Validation, Data Transformation, Data Modeling, CSV, Parquet\
Tools \& Workflow → Git, GitHub, Linux, Docker\
Big Data Ecosystem → Apache Hadoop, Apache Hive, Apache Spark, Apache Kafka, Apache Airflow, HBase, ZooKeeper

CURRENTLY LEARNING:\
Apache Airflow, Apache Spark, Apache Kafka, Hadoop ecosystem, Docker-based data infrastructure.

PROJECTS:

Title: Olist Data Engineering Project\
One-line summary: Building a data processing workflow for the Olist dataset, transforming raw data into structured and analysis-ready datasets.\
Category: Data Engineering\
Status: In Progress\
Date: 2026\
My role: Data Engineer\
Highlights:

- Processing and cleaning multiple raw Olist datasets using Python and Pandas.
- Transforming raw datasets into structured Parquet files and preparing them for downstream processing.
- Designing relational database tables and loading processed data into MySQL.\
  Tech list: Python, Pandas, MySQL, SQL, Parquet, Git\
  GitHub URL: [https://github.com/amretman77/depi-project](https://github.com/amretman77/depi-project)\
  Demo URL:\
  Featured: yes

Title: FIFA Player Market Value ML Pipeline\
One-line summary: A machine learning project focused on football player market value prediction using FIFA player data.\
Category: Machine Learning / Data Analysis\
Status: Completed (confirm)\
Date:\
My role: Machine Learning Developer\
Highlights:

- Exploring FIFA player attributes and preparing datasets for machine learning.
- Building a machine learning workflow for player market value prediction.
- Applying data processing and predictive modeling techniques.\
  Tech list: Python, Pandas, NumPy, Scikit-learn\
  GitHub URL: [https://github.com/amretman77/FIFA-Player-Market-Value-ML-Pipeline](https://github.com/amretman77/FIFA-Player-Market-Value-ML-Pipeline)\
  Demo URL:\
  Featured: yes

RESEARCH INTERESTS:

- Data Infrastructure \& Distributed Systems — Exploring distributed data storage, processing systems, and architectures for large-scale data workloads.
- Data Quality \& Pipeline Reliability — Interested in validation, schema enforcement, data consistency, and building dependable pipelines.
- AI Applications in Data Engineering — Exploring how AI can assist with data processing, automation, data quality, and intelligent data workflows.

EXPERIENCE / TRAINING:

Title: Big Data Analytics Training\
Organization: ITIDA / NTI\
Period: August 2026 – September 2026\
Current: no\
Bullets:

- Completed a 120-hour training program covering technical skills and freelancing fundamentals.
- Completed 90 hours of technical training and 30 hours focused on freelancing.
- Worked with data analysis, Python, SQL, and foundational Big Data concepts.
- Achieved an overall training score of 88%.

EDUCATION:\
Degree: Bachelor's Degree in Computer Science\
University: Alexandria University — Faculty of Computers and Data Science\
Period: 2024 – 2028 (confirm)\
GPA: 3.05\
Coursework:

- Data Analysis and Machine Learning
- Database Systems and SQL
- Programming and Computer Science Fundamentals

COURSES / CERTIFICATES:\
ITIDA / NTI Big Data Analytics Training — 120 Hours — August–September 2026

BLOG POSTS: none

ACCENT COLOR: #3B82F6\
PREFERRED FONT STYLE: Modern, clean, minimal, technical (Inter or Geist)

LANGUAGES: English + Arabic

DOMAIN: not yet\
CONTACT FORM ENDPOINT: mailto only

---

## Acceptance checklist (verify before you answer; fix and re-check if anything fails)

- \[ \] `grep -ri` for the placeholder-free names shows **no** hard-coded personal data outside `data.js`.
- \[ \] Deleting a value in `data.js` (e.g. `links.linkedin`, all `blog` posts) hides its UI and nav item with no console errors.
- \[ \] Opens correctly from `file://` and from a static server.
- \[ \] Light + dark mode both look finished; contrast checked for text, accent, chips, and borders.
- \[ \] Mobile (360px) and desktop (1440px): no horizontal scroll, nav drawer works, modal and palette are usable by keyboard only.
- \[ \] `prefers-reduced-motion: reduce` disables the hero typing, reveal and progress animations.
- \[ \] If i18n is on: RTL layout has no overlapping/misaligned elements.
- \[ \] No console errors/warnings with default placeholder data.
- \[ \] Includes `README.md` with: how to edit `data.js`, how to add a project/blog post, how to replace the CV/photo/OG image, how to deploy to Vercel/GitHub Pages, and an SEO checklist (Search Console, sitemap).

Start now: first reply with the file tree (short), then build everything.
