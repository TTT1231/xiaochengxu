---
paths:
   - 'tsconfig.json'
---

# TypeScript Config Options

## Status

Project upgraded to **TypeScript 5.9 + vue-tsc 2.2**. The deprecated TS 4.x options have been replaced.

## Change History

- **TS 4.9 → 5.9**: Replaced `importsNotUsedAsValues` + `preserveValueImports` with `verbatimModuleSyntax: true`
- **TS 5.x**: Removed `ignoreDeprecations: "6.0"` (option no longer exists in TS 5)

## Current Config

`tsconfig.json` uses `verbatimModuleSyntax: true` — the TS 5 standard replacement for the deprecated combo.

## Enforcement

- ✅ Use `verbatimModuleSyntax: true` (TS 5 standard)
- ❌ Do NOT add back `importsNotUsedAsValues` or `preserveValueImports` (deprecated in TS 5)
- ❌ Do NOT add back `ignoreDeprecations` (removed in TS 5)
