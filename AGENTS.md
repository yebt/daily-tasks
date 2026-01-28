# Agent Instructions

## Package Manager

**IMPORTANT**: Always use `bun` instead of `npm` for all package management commands.

### Common Commands

- Install dependencies: `bun install`
- Add a package: `bun add package-name`
- Add dev dependency: `bun add -d package-name`
- Remove a package: `bun remove package-name`
- Update packages: `bun update`
- Run scripts: `bun run script-name` or `bun script-name`

### Why Bun?

This project uses Bun as its package manager and JavaScript runtime. Using npm will create inconsistencies with the lock file (bun.lock) and may cause version conflicts.

### Never Use

- ❌ `npm install`
- ❌ `npm add`
- ❌ `npm run`
- ❌ `npm update`

### Always Use

- ✅ `bun install`
- ✅ `bun add`
- ✅ `bun run`
- ✅ `bun update`
