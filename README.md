# Cntryl Website

The static marketing and product-documentation site for Fitz, Cassie, Midge,
and the Fitz TypeScript and Go clients.

## Local development

Requires Node.js 20.19 or later.

```bash
npm ci
npm run dev
```

## Verification

`npm run check` is the release gate. It checks formatting, linting, types,
catalog and editorial contracts, the browser build, static generation, and the
generated GitHub Pages output.

## Publishing

Publishing is intentionally manual through the repository's `Deploy` workflow.
