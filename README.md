# Inky Paws Game Builders

Open `index.html` in a modern browser to see the **Inky Paws Game Builders gallery**. Choose **Open Builder** on Flying Quiz Builder, then use **← All Game Builders** to return. Flying Quiz is the only active builder; the three Coming Soon cards are disabled placeholders without destinations.

No installation, backend, build step, or server is needed. The same folder can be hosted on GitHub Pages or another static website host.

## Website structure

```text
index.html                         Gallery
.nojekyll                          Serve the repository as plain static files
css/gallery.css                    Gallery styles
assets/thumbnails/flying-quiz.svg   Original gallery thumbnail
assets/inky-paws/README.md          Built-in artwork notes
builders/flying-quiz/
  index.html                       Flying Quiz Builder
  css/builder.css
  js/app.js
  js/shared/                       Media, project files, preview, export
  js/flying-quiz/                   Editor and independent game runtime
tests/                             Browser checks for the website and builder
```

All navigation and resource paths are relative. The gallery links to `builders/flying-quiz/index.html`; the builder links back to `../../index.html`. This works with `file://`, a domain root, or a GitHub Pages project path such as `/repository-name/`. No GitHub Pages domain is hardcoded. Publish this repository's root as the Pages site; no custom build or routing service is needed. `.nojekyll` is included for plain static hosting. This restructuring does not deploy the site.

To add a future builder, give it its own directory under `builders/`, add an active gallery card pointing to its `index.html`, and include a relative link back to the gallery. Keep each builder's preview/export logic independent of gallery navigation.

## Use

1. Open Flying Quiz Builder from the gallery, then edit the example question cards or add your own. Each card supports multiple choice, typed answers, or word order, plus duplicate, delete, and move actions.
2. Adjust settings and optional images/audio. Uploaded files are embedded; http(s) URLs remain external dependencies.
3. Play in the live preview, choose Phone to check a narrow layout, or use Pop out / Fullscreen. Valid edits restart the preview. Incomplete questions preserve the last playable preview and disable game export.
4. Download HTML for an independent game, or copy iframe code for platforms permitting `srcdoc` and scripts.
5. Save project downloads editable `.inky.json`. Load project restores settings, questions, and embedded media. Exported HTML is a playable artifact, not the editable project format. Projects are not autosaved; save JSON before closing.

## Rules

- Questions run in authored order. Multiple-choice options and word tokens are shuffled.
- Correct answers earn one star and move to the next question. The last star is awarded before victory.
- Wrong answers or expired timers remove one life. The learner retries the same question with a fresh timer while lives remain.
- Typed answers ignore case and repeated/outer whitespace; punctuation must match. Word order uses individual selectable tokens, supports repeated words, and requires explicit submission.
- Restart clears pending transitions, timers, progress, and audio. Music stops on either ending. Built-in effect tones are available without audio files.
- Reduced-motion preferences are respected. Transparent background disables scenery. Custom overlay appears continuously, or only at night when day/night cycling is enabled.

## Portability and limits

Default games run offline. Uploaded images/audio are included in JSON and HTML. Linked media requires the original URL to remain available; this builder does not fetch and repackage remote media. Fonts use local system fallbacks. Rich HTML and LaTeX are treated as plain text in V1.

Image uploads: up to 5 MB each, PNG/JPEG/GIF/WebP/AVIF/BMP. Audio: up to 10 MB each in common browser-supported formats. JSON import limit: 80 MB. Up to 300 questions, with 1–8 incorrect choices per multiple-choice question. Large media creates large exports and embed codes. Platform restrictions may prevent iframe embeds; downloading/hosting the HTML is another option.

## Flying Quiz architecture

The following paths are relative to `builders/flying-quiz/`:

- `js/flying-quiz/project.js`: versioned data model, defaults, validation.
- `question-cards.js`, `editor.js`, `js/app.js`: editor UI and state.
- `js/shared/`: reusable media, project file, preview, and export utilities.
- `game-runtime.js`: independent game function serialized into the exported document.
- `game-styles.js`, `game-template.js`: game presentation and safe document assembly.

All editor scripts are ordinary deferred scripts so the builder works under `file://`. The runtime, game styles, and safely serialized project are assembled into one HTML document for both preview and export. Teacher text is rendered as text, not executable HTML. Only http(s) media URLs and supported uploaded media are accepted. Iframe output is sandboxed with script permission.

## Verification

Open `tests/project.test.html` for browser-based data, export, and gameplay checks. Open `tests/interface.test.html` for editor integration checks. Open `tests/gallery.test.html` for navigation, relative resources, and disabled placeholder checks. These checks need no test framework or network connection. Automated checks that inspect local iframe documents may require a browser test session permitting local-file access; normal use of the gallery and builder does not.

## Gallery restructuring file manifest

Moved files (the existing JavaScript contents are unchanged):

| Previous path | Current path |
| --- | --- |
| `index.html` (builder) | `builders/flying-quiz/index.html` |
| `css/builder.css` | `builders/flying-quiz/css/builder.css` |
| `js/app.js` | `builders/flying-quiz/js/app.js` |
| `js/shared/assets.js` | `builders/flying-quiz/js/shared/assets.js` |
| `js/shared/project-io.js` | `builders/flying-quiz/js/shared/project-io.js` |
| `js/shared/export.js` | `builders/flying-quiz/js/shared/export.js` |
| `js/shared/preview.js` | `builders/flying-quiz/js/shared/preview.js` |
| `js/flying-quiz/project.js` | `builders/flying-quiz/js/flying-quiz/project.js` |
| `js/flying-quiz/editor.js` | `builders/flying-quiz/js/flying-quiz/editor.js` |
| `js/flying-quiz/question-cards.js` | `builders/flying-quiz/js/flying-quiz/question-cards.js` |
| `js/flying-quiz/game-runtime.js` | `builders/flying-quiz/js/flying-quiz/game-runtime.js` |
| `js/flying-quiz/game-styles.js` | `builders/flying-quiz/js/flying-quiz/game-styles.js` |
| `js/flying-quiz/game-template.js` | `builders/flying-quiz/js/flying-quiz/game-template.js` |

Created:

- `index.html`: new gallery replacing the moved builder entry page.
- `css/gallery.css`: responsive gallery styling.
- `assets/thumbnails/flying-quiz.svg`: original Inky Paws thumbnail.
- `.nojekyll`: plain static Pages hosting marker.
- `tests/gallery.test.html` and `tests/gallery.test.js`: gallery navigation and resource checks.

Changed after moving:

- `builders/flying-quiz/index.html`: brand links to the gallery; added the explicit All Game Builders link. CSS/JS references remain relative to the moved page.
- `builders/flying-quiz/css/builder.css`: appended back-link and wrapping header styles.

Changed in place:

- `tests/interface.test.html`: points to the relocated builder.
- `tests/project.test.html`: points to the relocated builder scripts.
- `assets/inky-paws/README.md`: updated the runtime path.
- `README.md`: gallery usage, static hosting, folder structure, and this manifest.

No game logic, project format, media processing, preview, or export JavaScript was changed. No second builder was created.
