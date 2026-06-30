# Gvensan's Tools — Landing Page

Static landing page that showcases every Chrome extension in this monorepo. It
lives here in the monorepo (under `webpage/`) and deploys to GitHub Pages via
GitHub Actions — so a single commit covers both the extensions and the page that
links to them.

```
webpage/
├── index.html        — the page
├── style.css         — modern minimal styling (no framework, no JS)
├── privacy/          — one privacy policy per plugin + shared style.css
└── icons/            — 128×128 PNG per plugin (copies of each
    ├── linkedin.png    package's public/icons/icon-128.png)
    ├── github.png
    ├── x.png
    ├── youtube.png
    ├── reddit.png
    ├── huggingface.png
    └── hackernews.png
```

No build step. No JavaScript. No third-party dependencies. Just open
`index.html` in a browser to preview locally.

All seven tools are live on the Chrome Web Store and each card's primary button
links straight to its listing.

---

## Deployment

The site is published by [`.github/workflows/pages.yml`](../.github/workflows/pages.yml)
at the repo root. On any push to `main` that touches `webpage/**` (or a manual
run from the Actions tab), the workflow uploads the `webpage/` folder and
deploys it to GitHub Pages.

One-time setup (already done for this repo): repo **Settings → Pages → Source:
GitHub Actions**.

### Custom domain (optional)

1. Repo **Settings → Pages → Custom domain** → enter your domain.
2. Add a `CNAME` DNS record pointing the domain at `gvensan.github.io`.
3. Drop a file named `CNAME` (no extension) into `webpage/` with the bare
   domain inside.

---

## Local preview

```bash
# from this folder
python3 -m http.server 8080
# → open http://localhost:8080
```

Or just double-click `index.html` — most browsers serve from `file://` fine, but
using a server avoids any cross-origin oddities with icon loading.

---

## Design notes

- Tokens (colors, spacing, radii) in CSS custom properties at the top of
  `style.css`. Brand color: `#2557D3` matches the `brand-600` Tailwind token
  used inside each extension.
- Auto dark mode via `prefers-color-scheme: dark`.
- Mobile-first responsive grid; tool cards reflow at <320 px.
- No JavaScript. Hover affordances + smooth scroll are pure CSS.
- One web font: none. Uses the system stack for speed and zero requests.
