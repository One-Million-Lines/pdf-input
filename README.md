# FillLink

## Project Name

FillLink (`pdf-input`)

## What it does

FillLink is a local-first PDF form builder. You upload a PDF, place fillable fields on top of it, save the template in the browser, open a shareable fill page, and download a filled PDF.

## Why it exists

This project explores a lightweight document workflow that works without a required backend database. The current frontend keeps templates and uploaded PDFs in the browser, which makes it useful as a prototype for simple internal form flows.

## Features

- Upload a PDF and extract page sizes with `react-pdf`
- Create template records with generated template IDs and share IDs
- Drag and drop text, date, and select fields onto PDF pages
- Edit field labels, defaults, sizes, and required status
- Save templates locally in IndexedDB
- Open a `/fill/:shareId` route for form completion
- Auto-fill date fields and validate required fields before download
- Generate a filled PDF in the browser with `pdf-lib`
- Optional FastAPI backend with basic health endpoints

## How it works

1. The dashboard accepts a PDF upload and reads page metadata.
2. The app stores the original PDF and template definition in IndexedDB (`filllink-db`).
3. The editor saves field coordinates as relative values, so placement scales with each page.
4. The fill page loads a template by `shareId`, collects field values, and generates a new PDF client-side.
5. The backend is currently minimal and not wired into the main frontend workflow.

## Tech stack

- Vite
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- `react-pdf` / PDF.js
- `pdf-lib`
- `idb` for IndexedDB storage
- `react-dnd` for field placement
- FastAPI + Uvicorn for the optional backend shell

## Project structure

```text
pdf-input/
├── src/
│   ├── api/              # template helpers
│   ├── components/       # dashboard, editor, ui components
│   ├── hooks/            # react-query hooks
│   ├── lib/              # IndexedDB and PDF utilities
│   ├── pages/            # dashboard, editor, fill page
│   └── types/            # template types
├── backend/              # optional FastAPI service
└── public/               # static assets
```

## Getting started

### Frontend

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5303`.

### Optional backend

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/_ops/pip/requirements.txt
cp .env.example .env
cd backend
../backend/.venv/bin/python main.py
```

The backend defaults to `http://localhost:5203`.

## Configuration

The frontend does not require any custom environment variables.

If you run the backend, it reads environment variables from a project-root `.env` file. See `.env.example` for the supported keys.

## Usage

1. Open the dashboard.
2. Upload a PDF.
3. Add and configure fields in the editor.
4. Save the template and copy or open the fill link.
5. Complete the form and download the filled PDF.

## Development

Available scripts:

- `npm run dev` — start the frontend dev server
- `npm run build` — create a production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Roadmap

- Connect the frontend to a real backend persistence layer
- Add template import/export
- Support more field types and richer validation
- Add authentication and multi-user sharing controls

## Contributing

Contributions are welcome. See `CONTRIBUTING.md` for workflow and expectations.

## License

MIT. See `LICENSE`.
