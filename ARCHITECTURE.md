## Naming conventions

The following naming conventions are used for files and data in the project:

- **Files and folders** use *kebab-case*.
- **True constants** use *UPPER_SNAKE_CASE*.
- **Ordinary constants** use *camelCase*.
- **Variables and properties** use *camelCase*.
- **Functions and methods** use *camelCase*.
- **Classes** use *PascalCase*.
- **Interfaces** use *PascalCase*.
- **Type aliases** use *PascalCase*.
- **Booleans** start with *is*, *has*, *can*, or *should*.

* **Public entry points** are named *index.ts*.

True constants are fixed, broadly applicable values with a well-established meaning. Ordinary constants are values declared with const that are local to a particular implementation or context.

## File Import Conventions

A module may import another module if at least one condition holds:

1. **Public Hierarchy Package** — The target is the entry point of a sibling or descendant package.
2. **Internal Implementation** — The target is an implementation module belonging to the same package.
3. **Foundation** — The target is a top-level foundational module.

The following restrictions apply:

1. **No Circular Dependencies** — Circular dependencies between packages are forbidden.
2. **Foundation Isolation** — Foundational modules may not import non-foundational modules.