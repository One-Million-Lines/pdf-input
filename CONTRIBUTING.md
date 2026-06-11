# Contributing

Thanks for your interest in FillLink.

## Before you start

- Read `public.md` for the public collaboration note.
- Keep changes scoped and easy to review.
- Do not commit local PDFs, `.env` files, or generated assets.

## Local setup

```bash
npm install
npm run dev
```

Optional backend:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/_ops/pip/requirements.txt
cp .env.example .env
cd backend
../backend/.venv/bin/python main.py
```

## Suggested workflow

1. Create a branch for your change.
2. Make small, focused commits.
3. Run `npm run lint` and `npm run build` before opening a PR.
4. Include screenshots or short notes for UI changes.

## Contribution guidelines

- Keep the README aligned with real behavior.
- Prefer incremental improvements over broad rewrites.
- If you add backend config, also update `.env.example`.
- If you change the local storage model, document migration impact clearly.

## Pull requests

Please include:

- what changed
- why it changed
- how you tested it

## Questions

If you want to coordinate before contributing, use the public contact note in `public.md`.
