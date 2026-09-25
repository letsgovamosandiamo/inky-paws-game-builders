MathJax 3.2.2, `es5/tex-svg-full.js`, downloaded from the MathJax npm distribution at `https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg-full.js`.

`mathjax-source.js` wraps the unmodified distribution source as a JavaScript string. This allows local-file builders to include the renderer directly in standalone HTML without runtime fetches. The renderer is included in exports only when math is enabled. The Apache-2.0 license is in `LICENSE-mathjax.txt`.

Exports enable a fixed set of bundled TeX packages. Remote extension loading and the context menu are not enabled. Documentation: https://docs.mathjax.org/en/v3.2/web/components/index.html
