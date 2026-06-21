# M Talha Jameel — Portfolio

A self-contained, animated, monochrome (cyber-minimal) personal portfolio site.
Pure HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no
external JS libraries, no backend.

## File structure

```
portfolio/
├─ index.html                  basic shell / entry page
├─ portfolio.html              the full site (all sections + data)
├─ styles.css                  all design tokens + component styles
├─ script.js                   theme engine, particle network, animations
├─ M_Talha_Jameel_Resume.pdf   resume (download + view)
├─ talha img.jpg               profile photo
└─ README.md                   this file
```

Everything lives in one flat folder — no subfolders — so the zip can be
extracted anywhere and opened directly with no broken links.

## Pages

- **index.html** — a minimal entry page: name, role, tagline, and buttons to
  enter the full portfolio or grab the resume.
- **portfolio.html** — the complete site: Hero, About, Skills, Projects,
  My Journey (a combined narrative timeline of education + experience),
  Education, Experience, Certifications, and Contact. The animated
  particle-network background and scroll-reveal animations run across the
  **entire scrollable page**, not just the top section.

## Running it locally

No build step is required. Either:

1. Double-click `index.html` (or `portfolio.html`) to open it directly in a
   browser, or
2. Serve the folder with any static server, e.g.:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## Deploying

Drop the whole folder into any static host:

- **GitHub Pages** — push to a repo, enable Pages, set the root to this folder.
- **Vercel / Netlify** — drag-and-drop the folder (or connect the repo);
  no build command needed.

Set `index.html` as the site's entry point.

## Theme system

- Default theme is **dark**.
- Every color is a CSS variable, defined once per theme in `styles.css`
  under `[data-theme="dark"]` and `[data-theme="light"]`.
- The toggle button flips a single `data-theme` attribute on `<html>`;
  every section, badge, card, and the canvas animation updates instantly.
- The choice is remembered via `localStorage` across visits.

## Editing content

All copy (name, summary, skills, projects, certifications, experience,
contact details) lives as plain text inside `portfolio.html`. Open the file,
find the relevant `<section id="...">`, edit the text, save, and refresh —
no data files, no rebuild.

To swap the resume: replace `M_Talha_Jameel_Resume.pdf` with a new file using
the **exact same filename**. Both the download and "view in browser" links
in `index.html` and `portfolio.html` will pick it up automatically.

## Contact integrations

- **WhatsApp** — `https://wa.me/923211912419` with an optional pre-filled
  greeting via `?text=`.
- **Email** — `mailto:muhammadtalhajameel475@gmail.com`.
- **LinkedIn** — `https://linkedin.com/in/Talha`.
- **GitHub** — `https://github.com/Talha-tech-web`.
- **Contact form** — builds a `mailto:` link from the typed Name / Email /
  Message and opens the visitor's email client. No backend, nothing to host
  or maintain.

## Design system (locked)

Strictly monochrome — no blue, pink, purple, or green anywhere. Colors live
entirely in `styles.css` as CSS custom properties; see that file's top
section for the full dark/light token table.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses `Canvas API`,
`IntersectionObserver`, and CSS custom properties — all widely supported.
Respects `prefers-reduced-motion` for visitors who need reduced animation.
