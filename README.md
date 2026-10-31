# A Very Gentle Walk Through of Qwen-3.8-Flash-Next

An illustrated, interactive architecture guide for readers familiar with Llama 3.

**Website:** https://yuanlin2004.github.io/a_very_gentle_walk_through_of_qwen3.8_flash_next/

Shape-derived estimates and illustrative demos are identified in the page. Public background references are listed in the walkthrough.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build step or npm dependencies. Google Fonts are optional; system font fallbacks work offline.

## Publish

GitHub Pages can publish directly from **main / (root)**. The repository also includes a manual GitHub Actions deployment workflow if Pages is configured to use GitHub Actions instead. Do not enable both publishing methods at once.

## Contents

- `index.html` — narrative, diagrams, source links, and semantic markup
- `style.css` — responsive layout, light/dark themes, print styles
- `app.js` — architecture comparison, gated-write example, illustrative sparse selection and routing, cache calculator, reading progress
- `assets/favicon.svg` — local vector favicon

The cache calculator derives sizes from the source's shapes: GDN matrices are `36 × 48 × 128 × 128 × 4` bytes; QSA KV and block summaries are `24,576 + 768` bytes per token. It excludes weights, working buffers, convolution history, MTP, and allocation overhead.
