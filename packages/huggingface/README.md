# Hugging Face Search Toolkit

A Chrome extension that composes Hugging Face Models / Datasets /
Spaces search URLs and opens them in a new tab — no scraping, no
automation, no API calls. The extension **only generates URLs**; the
user (or the browser) does everything else.

---

## Install / Run

```bash
npm install                          # at the monorepo root
npm run build:huggingface            # produces packages/huggingface/dist/
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/huggingface/dist/`.

For development with HMR:

```bash
npm run dev:huggingface              # vite dev server on :5181
```

---

## How to use

The popup has five views (bottom navigation):

1. **Templates** — one-click recipes grouped by intent (Personal /
   Models / Datasets / Spaces). Each card has **Open** and **Customize**.
2. **Builder** — three tabs (**Models** / **Datasets** / **Spaces**),
   each with a typed form mirroring Hugging Face's filter sidebar. A
   live URL preview updates on every keystroke. The Save dialog detects
   when the same URL is already saved and offers a one-click **Update X
   instead**; editing an existing saved entry overwrites it in place.
3. **Saved** — your library of saved searches with tag filters.
4. **Settings** — theme, display mode, defaults, JSON backup/restore.
5. **About** — privacy, sibling extensions.

### Open mode

- **Side panel** (default) — stays open while you browse Hugging Face.
- **Popup** — classic toolbar window; closes on outside click.

---

## The three Builder tabs

### Models (`/models`)

| Field | Param | Example |
| --- | --- | --- |
| Free text | `search=` | `llama 3` |
| Pipeline tag | `pipeline_tag=` | `text-generation`, `text-to-image` |
| Library | `library=` | `transformers`, `diffusers`, `gguf`, `mlx` |
| Language | `language=` | `en`, `multilingual` |
| License | `license=` | `mit`, `apache-2.0`, `llama2`, `openrail` |
| Trained-on dataset | `dataset=` | `wikipedia`, `c4` |
| Author / org | `author=` | `meta-llama`, `mistralai` |
| Other tags | repeating `other=` | `conversational`, `agent` (AND-combined) |
| Sort | `sort=` | trending / downloads / likes / created / modified |
| Direction | `direction=-1` if asc | (omitted for desc) |

### Datasets (`/datasets`)

| Field | Param | Example |
| --- | --- | --- |
| Free text | `search=` | `common voice` |
| Task category | `task_categories=` | `text-classification` |
| Task id | `task_ids=` | `sentiment-classification` |
| Language | `language=` | `en`, `multilingual` |
| License | `license=` | `cc-by-4.0`, `apache-2.0` |
| Size | `size_categories=` | `n<1K` … `n>1T` (11 buckets) |
| Modality | `modality=` | text / image / audio / video / tabular / 3d / geospatial / time-series |
| Multilinguality | `multilinguality=` | monolingual / multilingual / translation |
| Source dataset | `source_datasets=` | upstream slug |
| Sort + direction | (same as Models) | |

### Spaces (`/spaces`)

| Field | Param | Example |
| --- | --- | --- |
| Free text | `search=` | `chatbot` |
| SDK | `sdk=` | gradio / streamlit / docker / static |
| Pipeline tag | `pipeline_tag=` | `text-to-image` |
| Uses model | `models=` | `stabilityai/stable-diffusion-3-medium` |
| Uses dataset | `datasets=` | `wikipedia` |
| Sort + direction | (same as Models) | |

---

## Built-in templates

Currently 16 templates across 4 groups:

### Personal
- **Daily Papers** — HF's curated daily ML paper digest.
- **My liked models** — login-bound likes view.

### Models
- **Trending LLMs** — `pipeline_tag=text-generation + sort=trending`.
- **Top image-generation models** — `pipeline_tag=text-to-image + sort=downloads`.
- **Permissive-license LLMs** — `+ license=apache-2.0`.
- **Recently created models on a topic** — `search=… + sort=created`.
- **Models trained on a dataset** — `dataset=wikipedia` etc.
- **Models from an author or org** — `author=meta-llama` etc.
- **GGUF quantized models** — `library=gguf` (llama.cpp / Ollama / LM Studio compatible).

### Datasets
- **Datasets for a task** — `task_categories=text-classification`.
- **Large multilingual datasets** — `size_categories=10M<n<100M + multilinguality=multilingual`.
- **Trending image datasets** — `modality=image`.
- **Permissive-license datasets** — `license=apache-2.0`.

### Spaces
- **Trending Gradio demos** — `sdk=gradio + sort=trending`.
- **Spaces for a task** — `pipeline_tag=text-to-image`.
- **Spaces using a specific model** — `models=<slug>`.

---

## What this extension does **not** do

- **No background scraping.** No content scripts, no scheduled reads,
  no fetches against Hugging Face endpoints.
- **No automation.** No clicks, no API calls, no programmatic navigation.
- **No data leaves your machine.** All saved searches and settings live
  in `chrome.storage.local`.

---

## Backup / Restore

Settings → Backup → **Export JSON** writes everything the extension
stores to a downloadable file. **Import JSON** reads such a file back.
Backup files with unsupported settings values are rejected by a strict
pre-import gate before any storage write — a corrupt backup can't
clobber your saved searches.

---

## Adding a built-in template

1. Open `packages/huggingface/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, a short
   `title`, a `description`, a `group`, and a `search: SearchInput`.
3. Run `npm test -w @toolkit/huggingface-extension` — the suite verifies
   every template produces a `huggingface.co` URL and IDs are unique.

---

## Project structure

```
packages/huggingface/
├── src/
│   ├── manifest.json                — MV3 manifest
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — typed URL builders per vertical
│   │   ├── params.ts                — UI options (sorts, modalities, sizes)
│   │   ├── templates.ts             — built-in template list
│   │   └── template-preview.ts      — pretty-print a SearchInput
│   └── popup/
│       ├── App.svelte               — root component, view router
│       ├── components/              — form + list components
│       ├── stores/                  — builder / saved / settings
│       └── views/                   — Templates / Builder / Saved / Settings / About
├── tests/                           — vitest suite
├── public/icons/                    — toolbar/store icons
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Shared UI primitives (Tabs, Toggle, ChipGroup, Select, BooleanHelper,
KeywordsField, FamilySection, CollapsibleSection) live in
`packages/core` and are imported via `@toolkit/core`.

---

## Privacy & ToS

This extension only generates Hugging Face URLs and opens them in your
browser. It does not scrape, automate, or read content from Hugging
Face. Use at your own discretion and per Hugging Face's Terms of
Service.
