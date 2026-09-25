# Slot Machine

A local, independent Inky Paws builder. Despite its name, the reference mechanic is a claw machine: insert a coin, choose one of three columns, grab a random remaining toy, then answer the next authored question. Correct answers dispense a toy which must be clicked to collect. Wrong answers or expired timers return it to the cabinet and advance to the next question. Empty columns consume no attempt. There are exactly nine questions/attempts, no lives or retries. Reset starts a fresh game.

Choice questions accept any one marked correct option. Typed answers accept any listed alternative, ignoring case and outer whitespace. Options shuffle; questions stay in authored order. Optional question timers, scratch paper, four game languages, fifteen local palettes, toy positioning/sizing and plain-background removal are available. Bulk import uses `Question | wrong | *correct` or `Question | answer / alternative`.

Upload images (5 MB each) or audio (12 MB each) to embed them in saved JSON and exported HTML. Uploaded media has no dependency on its original file. Image/audio URLs remain external dependencies. Background removal on a remote image needs that host to permit cross-origin canvas access; uploading the image avoids this restriction. Fonts use system fallbacks. Optional LaTeX uses the vendored MathJax SVG renderer, embedded in the export when enabled, including offline rendering. Its Apache license and provenance are in `vendor/`.

Save project downloads editable JSON; load restores it. Drafts may contain fewer than nine questions, but preview/export needs nine valid questions. No autosave, backend, account, or installation. Valid edits restart the preview; invalid edits preserve the last working preview. Save before closing.

Download HTML produces one independent playable document. For an iframe in Genially, upload the downloaded HTML to your GitHub Pages repository, wait for deployment, paste its public HTTPS `.html` URL into the hosted game field, then Copy iframe. The builder cannot publish files itself. The URL must point to the downloaded game, not the editor. Replace the hosted file whenever you update the game. User-provided URL media must remain online; upload media for an offline game.

## Files

- `index.html`, `css/builder.css`: editor and responsive layout.
- `js/project.js`: versioned schema, validation, bulk import and defaults.
- `js/art.js`: original local SVG toy artwork.
- `js/media.js`: uploads, URL controls and local background removal.
- `js/editor.js`, `js/app.js`: question/toy/settings controls and preview lifecycle.
- `js/game-runtime.js`, `js/game-styles.js`: independent game.
- `js/export.js`: standalone assembly, JSON loading, downloads and hosted iframe code.
- `vendor/`: optional bundled MathJax, license and provenance.

All resource/navigation paths are relative, including `../../index.html` to the gallery. Nothing depends on Flying Quiz internals.
