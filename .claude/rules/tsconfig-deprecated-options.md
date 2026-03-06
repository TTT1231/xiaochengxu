---
paths:
   - 'tsconfig.json'
---

# TypeScript Deprecated Options - DO NOT FIX

## Rule

DO NOT fix, remove, or modify these deprecated TypeScript options in `tsconfig.json`:

- `importsNotUsedAsValues`
- `preserveValueImports`

These are inherited from `@vue/tsconfig/tsconfig.json` (uni-app framework dependency).

## Enforcement

When seeing TypeScript warnings about these options:

- ❌ Do NOT suggest adding `verbatimModuleSyntax`
- ❌ Do NOT attempt to override the base config
- ❌ Do NOT "fix" these warnings
- ✅ Ignore them - they are framework-level issues
