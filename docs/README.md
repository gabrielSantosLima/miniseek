# Docs

Study material for the project **From Scratch to an LLM**.

## Contents

| Path | Purpose |
|---|---|
| [`index.html`](index.html) | Interactive study guide (static HTML/CSS/JS). |
| [`STUDY_PLAN.md`](STUDY_PLAN.md) | The complete 18-chapter curriculum, schedule, theory outline, interactive exercise specifications, and mastery checklists. |
| [`REFERENCES.md`](REFERENCES.md) | Annotated bibliography, chapter-to-source map, download log, and licensing notes. |
| [`references/`](references/) | Locally downloaded papers and books (PDF). |
| `css/`, `js/`, `content/` | Guide styles, application logic, widgets, and chapter content. |

## Current status

The guide shell and Chapters 1–4 are implemented:

- Chapter navigation, hash routing, light/dark theme, and local progress tracking.
- Interactive widgets: LLM pipeline sorter, function/tangent explorer, secant-to-tangent lab, chain-rule builder, activation lab, and gradient-descent lab.
- Quizzes and mastery checklists for Chapters 1–4.
- Chapters 5–18 are listed in the navigation with a "planned" placeholder.

No LLM is implemented or trained in this phase.

## Run the guide

The guide is a static site. From the repository root:

```bash
python -m http.server 8123 --directory docs
```

Then open <http://localhost:8123/>.

Opening `docs/index.html` directly also works because the guide uses classic
scripts, but a local server avoids browser restrictions and is recommended.

The mathematical notation is rendered with KaTeX from a CDN, so the first load
needs network access. If the CDN is unavailable, the raw LaTeX remains visible.

## Next steps

1. Review Chapters 1–4 for pacing and difficulty.
2. Add Chapters 5–7 (multivariable calculus, linear algebra, probability) and
   their widgets.
3. Continue in chapter order up to the Transformer and capstone chapters.
