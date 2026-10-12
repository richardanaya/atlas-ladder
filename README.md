# Atlas Ladder

A mobile-first study tower for Objectivism, Ayn Rand’s philosophy, organized by topic. The first climb is Metaphysics, Unit 1 (the axioms) and Epistemology, Unit 1 (the senses). Later units are on the tower as coming soon, and they do not block a unit that is already built. On a wide screen the tower uses the full window: sections in a left rail, the climb in the center, and Atlas with your progress on the right.

There is no build step. `index.html` at the repository root is the page. Styles live in `css/`. Behavior is native ES modules under `js/`. Lesson text is JSON under `content/`.

## Run it locally

Modules and the lesson files are fetched, so open the folder through a local server. Opening `index.html` as a file will not work.

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173/`.

Progress (finished floors, XP, streak, and the mute setting) stays in `localStorage` under the key `atlas-ladder-progress-v1`. Reset is in the header on wider screens, and in the same dialog if you show the control.

## GitHub Pages

The site uses a hash router (`#/`, `#/lesson/...`, `#/sources`) and relative URLs, so it can live at a project path such as `/objectivist-duolingo/` or `/atlas-ladder/` without a rebuild.

Two ways to publish:

1. **Actions.** `.github/workflows/pages.yml` deploys on every push to `main`. In the repository settings, set Pages to **GitHub Actions**.
2. **Branch.** You can also deploy from the `main` branch, folder `/ (root)`. Keep the empty `.nojekyll` file so Jekyll does not touch the CSS or JSON.

`BASE_PATH` in `js/config.js` stays `''` for both of those. Set it only when the files are served from a nested folder and something needs an absolute URL. Include the leading and trailing slash, for example `"/atlas-ladder/"`.

## What you can do

- Climb the skill tree. Octagonal floors unlock in order. A coming-soon unit is visible and locked, and it is skipped when the app decides what opens next.
- Play a lesson: multiple choice, match (drag, or tap one side and then the other), fill-in-the-blank, tap-to-build sentences, and quote-source checks. Each answer gets a short explanation, marked Quoted or Paraphrase.
- Five hearts per attempt. A wrong answer costs one. At zero hearts the floor ends with no XP. The first time you clear a floor you earn XP (12 per correct answer, plus 20 if the floor was perfect). A replay keeps the streak and does not add XP.
- A daily streak, a level every 80 XP, and a lesson-complete screen.
- Sounds from the Web Audio API, with a mute toggle. No audio files.
- Atlas, the mascot, on the entrance, during a lesson, and on the cleared-floor screen. His states are idle, thinking, encourage, cheer, and celebrate.

## Add a lesson

1. Put the section’s exercises in `content/<section-id>.json`. The catalog names that file.
2. Add the lesson to the matching unit in `content/catalog.json`.
3. If the quotation is exact, add the wording and the citation to `SOURCES.md`. If you are not sure the wording is exact, mark the feedback `"kind": "paraphrase"` and do not put invented quotation marks around it.
4. Check the files:

```bash
node scripts/validate-content.mjs
node --test tests/progress.test.js
```

`scripts/author-content.mjs` regenerates the two built section files, the catalog, and `SOURCES.md` together. If you change a quotation, change it there and run the script, then the validator. The app itself reads the JSON, not the script.

### Catalog

`content/catalog.json` is the tower. A section has `id`, `title`, `accent` (`gold` or `copper`), `summary`, `file` (or `null` when nothing is built yet), and `units`. A unit has `id`, `title`, `status` (`ready` or `soon`), and `summary`. A ready unit also has `lessons`: `{ id, title, objective }`. Sections are topics. They are not keyed to a chapter outline.

Coming-soon units stay in the catalog so the tower can show them. They are left out of the unlock sequence.

### Section file

`content/metaphysics.json` (and the other section files) look like this:

```json
{
  "id": "metaphysics",
  "lessons": {
    "axioms/where-it-starts": {
      "exercises": []
    }
  }
}
```

The lesson key is `<unit id>/<lesson id>`. A built lesson needs 8 to 12 exercises. Each exercise has `id`, `type`, `prompt`, `answer`, and `feedback`.

| type | answer | extra fields |
| --- | --- | --- |
| `choice` | choice id | `choices: [{ id, text }]` |
| `quote` | choice id | `quote`, `choices` |
| `match` | omitted; each pair id matches itself | `pairs: [{ id, left, right }]` |
| `fill` | array of bank ids, one per blank, or the token order in sentence mode | `mode`: `blanks` or `sentence`; `before` / `after` or `sentence`; `bank: [{ id, text }]`; sentence mode also uses `distractors` |

`feedback` is `{ kind, note, citation }` and, when `kind` is `quote`, a short `quote`. `kind` is `quote` or `paraphrase`.

## Quotations

Accuracy matters more than color. The app quotes only short passages that were checked against the Ayn Rand Lexicon or a published excerpt. Anything else is labeled Paraphrase and is our wording. `SOURCES.md` lists every quotation and where it was checked. Galt’s speech is cited by the *For the New Intellectual* page numbers the Lexicon uses; the speech was written for *Atlas Shrugged* and is reprinted there. The in-app Sources screen reads that same file.

## Mascot

Atlas is an inline SVG in `js/components/atlas-mascot.js`, drawn as a chunky figure with a globe, colored in the same teal and paper palette as the rest of the tower. Looping motion is CSS. The hop, nod, and hoist use the Web Animations API. To swap in Rive or Lottie later, replace the SVG inside `.stage` and keep the `state` attribute (`idle`, `thinking`, `encourage`, `cheer`, `celebrate`).

## Code map

Visual pieces are web components (`atlas-mascot`, `skill-tree`, `lesson-player`, `exercise-choice`, `exercise-match`, `exercise-fill`, `exercise-quote`, `xp-bar`, `streak-flame`, `lesson-complete`). `App`, `Router`, `ProgressStore`, `SoundManager`, and `ContentLoader` are plain classes.
