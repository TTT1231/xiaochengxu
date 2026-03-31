---
paths:
   - 'tsconfig.json'
---

# TypeScript Deprecated Options - Already Handled

## Status

`importsNotUsedAsValues` and `preserveValueImports` are already overridden in `tsconfig.json` to suppress VS Code warnings. No further action needed.

## Context

- These options are inherited from `@vue/tsconfig/tsconfig.json` (uni-app framework dependency)
- Local tsc (4.9.5) does not report them as deprecated; only VS Code's bundled TS does
- Current override: `importsNotUsedAsValues: "remove"`, `preserveValueImports: false`

## Enforcement

- ❌ Do NOT suggest adding `verbatimModuleSyntax`
- ❌ Do NOT remove the overrides (they suppress IDE warnings)
- ✅ Ignore any remaining deprecation notices from VS Code
