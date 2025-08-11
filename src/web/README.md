# Web

PartBot's Web module handles networks and routing and stuff.

The setup isn't very pretty, but broadly:

- `@/web/api` has all the API endpoints; endpoints export a `handler` function and an optional `verb`.
- `@/web/ui` has all the frontend pages served under `SITE/`. Each file exports a `handler` that can either use `res.render` to render the given React code as static markup, or `res.getBundle` to load a bundle from `@/web/react/pages`.
- `@/web/react/pages` is compiled to bundles that are injected into pages that use `getBundle`, while `@/web/react/compiled` has the Webpack-compiled files for the same. Abstracted code for React is in `@/web/react/components`.
- `@/web/static` has static files served under `SITE/static`.

The loaders for all of these are in `@/web/loaders`, and use the file structure for nesting.
