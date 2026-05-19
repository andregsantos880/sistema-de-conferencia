# Katalyst Admin Template (Vite)

## Getting started

```bash
npm install
npm run dev
```

## Known issue (first install)

On some machines, **right after you run `npm install`**, you may see an error similar to:

```text
X [ERROR] Parameter decorators only work when experimental decorators are enabled
```

- This is **expected** and **does not affect the project**.
- We are working on a permanent fix.

### Workaround

- Re-run the command (for example `npm run dev`) after the install completes.
- The error goes after the second run.

---

## Shadcn/ui Configuration

This project uses **unmodified shadcn/ui components** with a folder-level ESLint exception:

- Shadcn components export both components AND variants/utilities in the same file
- We use a `.eslintrc.json` in `src/shared/ui/shadcn/` to disable `react-refresh/only-export-components` for third-party code only
- This allows shadcn updates to work seamlessly without breaking the build

**Why:** Shadcn/ui is a third-party library we don't control. Modifying it would break on updates. The `react-refresh/only-export-components` rule is enforced for **our own code** in `src/modules/` and `src/shared/` (excluding shadcn).
