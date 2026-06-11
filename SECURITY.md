# Security Policy

## Supported scope

Security fixes are best-effort for the current public code in this repository.

## Reporting a vulnerability

Please do **not** open a public issue for sensitive reports.

Instead, contact the maintainer through the public contact route listed in `public.md` and include:

- a short description of the issue
- affected files or routes
- reproduction steps
- possible impact

## Security notes

- Uploaded PDFs and template data are stored locally in the browser via IndexedDB.
- If you run the backend, keep `.env` local and never commit real keys.
- Share links are convenience identifiers, not hardened access controls.
- Review generated PDFs before sending them to third parties.
