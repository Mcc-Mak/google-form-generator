# AGENTS.md

Project: webapp to build a Google Form from a Google Sheet and save it to a specified Google Drive folder.

## Language

- Repo content is **Traditional Chinese** (繁體中文): documentation, UI-facing strings, and commit messages.
- Filenames, code identifiers, config keys, and the doc filenames listed below stay in English.

## Stack

- Frontend: GitHub Pages (static site, served from repo). Code lives in `codebase/gh/`.
- Backend: Google Apps Script (GAS). Code lives in `codebase/gas/`.
- Database: Google Sheets.

## Layout

- `codebase/gh/` — GitHub Pages frontend
- `codebase/gas/` — GAS backend
- `docbase/` — all project docs
- `CHANGELOG.md` (repo root) — versioned `major.minor.patch`

## Docs (`docbase/`)

`docbase/TOCTREE.md` is the doc index. Required docs (one file each):

`ProjectCharter.md`, `PRD.md`, `SRS.md`, `UserStories.md`, `ADR.md`, `Architecture.md`, `API.md`, `Schema.md`, `ERD.md`, `QuickStart.md`, `CRM.md`, `RTM.md`

- `CRM.md` = Cross-Reference Matrix.
- Use Mermaid (`sequenceDiagram`, `flowchart`, `erDiagram`, `stateDiagram`, etc.) for diagrams — never ASCII/console art. Fall back to plain text only if Mermaid is still invalid after 1 retry.

## Workflow

1. Code frontend in `codebase/gh/`.
2. Code backend in `codebase/gas/`.
3. Document under `docbase/` (see above).
4. Update `CHANGELOG.md` with `major.minor.patch`.
5. Git: commit (good subject + body incl. `major.minor.patch`) → push to `dev-001` → CI promotes `dev-001 → dev → main` → deploy to GitHub Pages.
6. (Re)deploy GAS with `clasp`.

## Git flow

- Working branch: `dev-001` (local checkout should be here).
- Promotion is CI-driven, not manual merge: `dev-001 → dev → main`.
- Do not push directly to `dev` or `main`.
- Commit messages: concise subject + body that includes the semantic version bump.

## GAS deploy

- Use `clasp` to push/deploy `codebase/gas/` to Apps Script.
- Requires `.clasp.json` + `clasp` auth; redeploy after backend changes.
