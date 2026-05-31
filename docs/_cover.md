# Pict Provider: Theme

> Runtime theme manager for Pict applications

Register theme bundles, apply them by injecting CSS custom properties, and switch dark / light / system modes at runtime &mdash; with a compiler that turns unrolled theme folders into single self-contained JSON bundles.

- **Theme bundles** &mdash; One JSON object per theme: a nested token map plus optional CSS, SVG, image, brand, and alias blocks, addressed by `Hash`
- **Runtime CSS custom properties** &mdash; `applyTheme()` flattens tokens into `--theme-*` properties in a single `<style>` element; consumers repaint on the next style recalc
- **Dark / light / system modes** &mdash; Paired `{ Light, Dark }` tokens; system mode is CSS-only via `@media (prefers-color-scheme)`, with no JavaScript listener
- **Stateless** &mdash; Holds the active theme in memory and persists nothing; host applications own theme persistence
- **`quack theme-build`** &mdash; Compile `manifest.json` + `css/` + `svg/` + `image/` into one self-contained bundle

[Quickstart](quickstart.md)
[Architecture](architecture.md)
[GitHub](https://github.com/fable-retold/pict-provider-theme)

<!-- docuserve:examples:start -->
| Example | Complexity | Launch |
|---------|------------|--------|
| [Theme Playground](examples/theme-playground/README.md) | Advanced | [&#9654; Launch](examples/theme-playground/index.html) |
<!-- docuserve:examples:end -->
