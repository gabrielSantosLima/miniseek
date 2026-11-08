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

The guide shell and all 21 chapters are implemented:

- Chapter navigation, hash routing, light/dark theme, and local progress tracking.
- Interactive widgets: LLM pipeline sorter, function/tangent explorer, secant-to-tangent lab, chain-rule builder, activation lab, gradient-descent lab, 2D gradient-field lab, matrix/linear-map lab, softmax/temperature lab, cross-entropy/KL lab, MLP approximation trainer, backpropagation step-through, gradient-check lab, optimizer race, recurrent gradient-flow lab, LSTM gate calculator, GRU gate calculator, attention-alignment lab, attention heatmap, Transformer shape tracer, sampling lab, capstone configurator, causal-LM window builder, and numerical-stability lab.
- Worked examples in every chapter, including sequence probability, calculus rules, matrix algebra, Bayes/softmax/KL, perceptron training, full backpropagation with a solved exercise, optimizer updates, RNN gradient flow, LSTM/GRU gates, attention weights/context, a tiny Transformer block, LLM loss/perplexity/top-p, capstone parameter budgeting, data windows, overflow-safe softmax, and the minimal model size.
- Quizzes and mastery checklists for all chapters.
- Part VI adds the minimal-LLM bridge: data pipeline, numerical stability, and the minimal viable training/generation blueprint.

No LLM is implemented or trained in this repository. The guide is the theory and design prerequisite for your manual implementation.

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

1. Review all 21 chapters for pacing, clarity, and calculation errors.
2. Test the guide on mobile and with the KaTeX CDN unavailable.
3. Use the guide as the theory and design reference for your manual implementation.
