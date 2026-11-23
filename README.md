# Amr Etman — Portfolio

A minimal, bilingual (EN / AR) portfolio website built as a static site with zero build steps and zero frameworks. Designed with a **calm technical editorial** aesthetic — generous whitespace, typographic hierarchy, thin borders, and quiet shadows.

> Works from `file://` protocol. Open `index.html` in any browser to preview locally.

---

## Tech Stack

| Layer | Detail |
|-------|--------|
| **Markup** | Semantic HTML5 |
| **Styling** | Custom CSS with design tokens, CSS logical properties for RTL, `prefers-reduced-motion` support |
| **Scripts** | Vanilla ES2020 classic scripts (globals under `window.Site`) — no bundler, no framework |
| **Fonts** | Inter (body), Fraunces (headings), IBM Plex Mono (code / labels) |
| **i18n** | English + Arabic, driven by `js/i18n.js` and bilingual strings in `data.js` |
| **Accent** | `#3B82F6` (light) / `#60A5FA` (dark) |

---

## File Structure

```
.
├── index.html              # Home / landing page
├── projects/
│   └── index.html          # Projects listing
├── blog/
│   ├── index.html          # Blog listing
│   └── _template.html      # Reusable post template
├── css/
│   ├── tokens.css          # Design tokens (colors, spacing, type scale)
│   ├── base.css            # Resets, global styles
│   └── components.css      # Reusable component styles
├── js/
│   ├── data-loader.js      # Loads & validates data.js
│   ├── render.js           # DOM rendering helpers
│   ├── ui.js               # Theme toggle, mobile nav, scroll
│   ├── i18n.js             # Language switching logic
│   └── hero-visual.js      # Animated agent-trace terminal
├── data.js                 # All personal data lives here
├── assets/
│   ├── favicon.svg         # SVG favicon (initials)
│   └── og-image.png        # 1200×630 social preview image
├── cv/
│   └── README.md           # Where to place your CV PDF
├── sitemap.xml
├── robots.txt
├── .gitignore               # Editor files, local secrets, and build artifacts
└── README.md               # ← You are here
```

---

## Editing Your Data

All personal information is stored in **`data.js`**, which assigns `window.SITE_DATA`. No personal strings are hardcoded in HTML, CSS, or JS. The file is loaded with a normal `<script>` tag (not a module), so the site also works when opened directly from `file://`.

Any user-facing text can be either a plain string or a bilingual object:

```js
name: "Your Name"                       // shown in every language
name: { en: "Your Name", ar: "اسمك" }   // translated
```

Leave any value as `""` (or an empty array) to hide the related UI — e.g. an empty `links.linkedin` removes the LinkedIn icon, and an empty `blog: []` removes the Writing section and its nav item.

### Schema overview

```js
window.SITE_DATA = {
  site:    { url, language, ogImage },
  theme:   { accent, accentDark, defaultMode },     // defaultMode: system | light | dark
  i18n:    { enabled, languages: ["en", "ar"] },
  profile: {
    name, initials, role, tagline, bio,
    aboutHtml: [ "<p>…</p>", "<p>…</p>" ],          // allowlist: p, strong, em, a, br, code
    photo, location,
    availability: { show: true, text },
    email, phone
  },
  links: { github, linkedin, twitter, kaggle, medium, youtube, website },
  cv:    { file, label },
  hero:  { stats: [ { value, label } ], traceLines: [ "→ …", "✓ …" ] },
  now:   { building, learning, reading },
  focusAreas: [ { icon, title, text } ],
  skills: {
    groups: [ { title, items: ["Python", "SQL"] } ],
    learning: { en: ["Apache Spark"], ar: ["Apache Spark"] }
  },
  projects:  [ /* see below */ ],
  research:  { items: [ { title, status, text } ], cta: { title, text } },
  experience: [ { title, org, period, current, badges, bullets } ],
  education:  [ { title, org, period, current, badges, bullets } ],
  courses:    [ { title, org, period, link } ],
  blog:       [ /* see below */ ],
  contact:    { intro, formEndpoint, responseTime },
  footer:     { text }
};
```

`data-loader.js` validates the shape, strips empty/malformed items and logs readable `console.warn`s for missing or misspelled keys — it never throws.

---

## Adding a Project

Add an entry to the `projects` array in `data.js`:

```js
{
  id: "project-slug",
  title: { en: "Project Name", ar: "اسم المشروع" },
  summary: { en: "One-liner.", ar: "وصف مختصر." },
  description: { en: "Longer overview…", ar: "نظرة أطول…" },
  category: { en: "Data Engineering", ar: "هندسة البيانات" },
  status: "Completed",                 // Completed | In Progress | Archived
  featured: true,                      // featured projects sort first
  date: "2026-01",                     // YYYY-MM
  role: { en: "Data Engineer", ar: "مهندس بيانات" },
  highlights: [ { en: "…", ar: "…" }, { en: "…", ar: "…" } ],
  tech: ["Python", "MySQL", "Parquet"],
  problem:  { en: "…", ar: "…" },
  approach: { en: "…", ar: "…" },
  result:   { en: "…", ar: "…" },
  links: { github: "https://…", demo: "", caseStudy: "" }
}
```

- `featured: true` projects are shown first on the home page (up to 6).
- Category and technology filters are generated automatically from the data.
- Empty `links.*` values hide their buttons.

---

## Adding a Blog Post

1. Add an entry to the `blog` array in `data.js`:

```js
{
  title: { en: "Post title", ar: "عنوان المقال" },
  date: "2026-11-20",
  category: { en: "Data Engineering", ar: "هندسة البيانات" },
  tags: ["ETL", "Python"],
  readingTime: { en: "7 min", ar: "7 دقائق" },
  summary: { en: "Brief excerpt.", ar: "مقتطف مختصر." },
  link: "blog/my-post.html"            // required
}
```

2. Copy `blog/_template.html` to `blog/my-post.html`.
3. Replace the title, date, description and body in the new file. The table of contents, reading-progress bar and code-copy buttons are automatic.
4. The post supports two language blocks (`data-lang-content="en"` / `"ar"`); the nav language switch toggles them.

Once at least one post exists, the Writing section and its nav item appear automatically on the home page and the blog archive.

---

## Replacing CV, Photo, and OG Image

| Asset | Location | Config |
|-------|----------|--------|
| **CV PDF** | `cv/Amr_Mostafa_CV.pdf` | Set `cv.file` in `data.js` (relative path, no leading `/`) |
| **Profile photo** | `assets/photo.webp` | Set `profile.photo` in `data.js`; leave `""` to hide |
| **OG image** | `assets/og-image.png` | Set `site.ogImage` in `data.js` — recommended size: 1200×630 px |

---

## Enabling / Configuring Arabic

Arabic is enabled out of the box. The language switcher in the navigation reads `i18n.js` and toggles `<html lang="..." dir="...">`.

- All CSS uses **logical properties** (`margin-inline-start`, `padding-block`, `border-inline-end`, etc.) so layouts flip automatically in RTL.
- To add or modify Arabic strings, edit the `ar` key in every bilingual object inside `data.js`.
- The first language in `i18n.languages` is the default; the visitor's choice is remembered in `localStorage`. Set `i18n.enabled` to `false` to force English only.

---

## Deployment

### Vercel

1. Push the repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework Preset: **Other**.
4. Build Command: leave empty (no build step).
5. Output Directory: `.` (root).
6. Deploy.

### GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)`.
5. Save — the site will be live at `https://<username>.github.io/<repo>/`.

### Netlify

1. Push the repo to GitHub.
2. Import the repo at [app.netlify.com](https://app.netlify.com).
3. Build Command: leave empty.
4. Publish Directory: `.`.
5. Deploy.

> After deploying, replace `YOUR-DOMAIN.example` in `sitemap.xml`, `robots.txt`, `data.js` (`site.url`) and the static meta fallbacks in the HTML pages with your real domain. Regenerate `assets/og-image.png` if you change your name or role.

---

## SEO Checklist

- [ ] Replace `YOUR-DOMAIN.example` with your real domain in `sitemap.xml`, `robots.txt`, and `data.js`.
- [ ] Create a 1200×630 px OG image and set `data.meta.ogImage`.
- [ ] Verify your site in [Google Search Console](https://search.google.com/search-console) and submit `sitemap.xml`.
- [ ] Ensure `meta.title` and `meta.description` are filled in `data.js` for both languages.
- [ ] Add a canonical `<link>` if you serve from multiple domains.
- [ ] Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator).
- [ ] Run [Lighthouse](https://developer.chrome.com/docs/lighthouse/) — aim for 95+ on Performance, Accessibility, Best Practices, and SEO.

---

## License

© Amr Etman. All rights reserved.
