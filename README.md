# Pablo Uribe Montoya — Curriculum Vitae

Interactive CV built with React + Vite.

## Run

```bash
npm install
npm run dev      # http://localhost:3005
npm run build    # production build in dist/
```

## Editing the content

All CV content lives in **`src/data/cv.json`**. Edit that file only; the page and the
generated PDF both read from it.

- **New job** → add an object at the top of `experience` (`role`, `company`, `location`, `start`, `end`, `highlights`, `tech`).
- **New skill** → add to an `items` list in `skills`, or add a new `{ "category", "items" }` group.
- **New portfolio project** → add to `portfolio`:
  ```json
  { "title": "My App", "description": "…", "tech": ["React"], "url": "https://…", "repo": "https://github.com/…" }
  ```
  Leave `url` / `repo` empty (`""`) to show it as a private/client project.
- **Languages** → `score` (0–100) controls the bar width.

## PDF download

The "Download CV (PDF)" button builds the PDF in the browser with jsPDF from `cv.json`.
Nothing is uploaded or stored. The layout is defined in `src/pdf/generateCvPdf.js`.
