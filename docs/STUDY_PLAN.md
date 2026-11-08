# From Scratch to an LLM

## A Chapter-by-Chapter Study Plan

> **Status: planning only.** This document defines the curriculum and the future
> interactive guide. No LLM, application, or code is implemented at this stage.
> The first implementation milestone will begin only after this plan is approved.

**Version:** 1.0  
**Date:** 2026-11-08  
**Primary language of the guide:** English  
**Final goal:** understand every mathematical and architectural idea needed to
build a small GPT-style language model from scratch, then implement it in a
later phase.

---

## 1. Purpose

This is not a collection of links. It is a sequenced curriculum designed to take
a learner from single-variable calculus to a working mental model of a
Transformer-based large language model (LLM).

The plan deliberately separates **understanding** from **implementation**:

1. **Now:** study the theory, derive the equations, complete the interactive
   exercises, and read the primary sources.
2. **Later:** implement a tiny automatic-differentiation engine, an MLP, an RNN,
   an LSTM/GRU, a mini-Transformer, and finally a small GPT-style model.

The curriculum is built around four pillars:

| Pillar | What it answers |
|---|---|
| Mathematics | Why do gradients, matrices, probabilities, and optimization work? |
| Neural networks | How does a network learn, and what does backpropagation compute? |
| Sequence models | How do RNNs, LSTMs, and GRUs represent time and memory? |
| Transformers | How does attention replace recurrence, and how does that become an LLM? |

### 1.1 End-state capabilities

By the end of this plan, the learner should be able to:

- Derive the chain rule, gradients, Jacobians, and Hessians by hand.
- Explain a neural network as a composition of affine maps and nonlinearities.
- Derive backpropagation from a computational graph, in both scalar and matrix
  form, including softmax + cross-entropy.
- Explain why plain RNNs suffer from vanishing and exploding gradients.
- Write the forward equations of an LSTM and a GRU from memory.
- Explain the original LSTM and GRU papers in their own terms.
- Derive scaled dot-product attention and multi-head attention from the
  *Attention Is All You Need* paper.
- Trace the full shape flow through a Transformer block.
- Explain tokenization, next-token prediction, decoding, and the pretraining
  objective of a decoder-only LLM.
- Read a modern LLM paper without treating the architecture as a black box.

### 1.2 Non-goals for this phase

- No code, no training runs, no datasets, no web app yet.
- No fine-tuning, RLHF, distributed training, or GPU optimization.
- No claim that a small educational model will match a production LLM.
- No mathematics shortcuts: if an equation is used later, it is derived or
  justified earlier.

---

## 2. Delivery Format (future HTML/CSS/JS guide)

The study guide will be a static, self-contained web application with no backend
and no mandatory build step.

### 2.1 Planned structure

```text
docs/
├── index.html                  # shell: navigation, chapter outlet, progress
├── css/
│   ├── base.css                # typography, layout, dark/light tokens
│   ├── chapters.css            # chapter-specific layout
│   └── widgets.css             # interactive exercise styling
├── js/
│   ├── app.js                  # bootstrap and routing
│   ├── router.js               # hash-based chapter navigation
│   ├── progress.js             # localStorage progress + mastery checklist
│   ├── quiz.js                 # multiple choice, numeric answer, validation
│   ├── math.js                 # KaTeX rendering helpers
│   └── widgets/
│       ├── derivative-lab.js
│       ├── gradient-descent.js
│       ├── matrix-lab.js
│       ├── softmax-lab.js
│       ├── backprop-graph.js
│       ├── rnn-unroll.js
│       ├── lstm-gates.js
│       ├── gru-gates.js
│       ├── attention-lab.js
│       └── transformer-shapes.js
├── content/
│   └── chapters/
│       ├── ch01.js ... ch18.js # chapter metadata + prose + exercise config
├── references/                 # downloaded primary sources (PDF)
└── STUDY_PLAN.md
```

### 2.2 Technical conventions

- **HTML5 + CSS + vanilla JavaScript**, no framework required.
- **KaTeX** (CDN or vendored) for mathematical notation.
- **SVG + Canvas** for graphs, gradients, attention heatmaps, and architecture
  diagrams.
- **localStorage** for progress, quiz scores, and exercise state.
- **Responsive layout** with keyboard-accessible controls.
- Every chapter has the same shape: goals, theory, worked derivations, readings,
  interactive exercises, mastery checklist.
- Exercises must work offline after the first load except for external links.
- No telemetry and no accounts.

### 2.3 Interactive exercise types

The guide will use six reusable exercise patterns:

1. **Parameter lab** — sliders controlling a mathematical object (learning rate,
   gate value, temperature, positional frequency) with an immediate visual and
   numeric readout.
2. **Step-through derivation** — the learner advances one line at a time and
   must choose the next algebraic step.
3. **Numeric answer** — the learner computes a derivative, gradient, softmax, or
   gate value and receives immediate feedback.
4. **Graph / matrix playground** — drag nodes or edit cells to see how a
   computational graph, matrix product, or attention matrix changes.
5. **Predict-then-reveal** — the learner predicts a shape, gradient sign, or
   output distribution before the guide reveals it.
6. **Timed recall** — short spaced-repetition prompts for equations and
   definitions.

These are described per chapter below. They are specifications, not yet
implementations.

---

## 3. Study Load and Schedule

| Item | Value |
|---|---|
| Chapters | 21 |
| Estimated study time | ~254 hours |
| Suggested pace | 10–15 hours/week |
| Calendar estimate | 22–26 weeks |
| Review | 15 minutes at the start of every session + one review week per part |
| Primary math text | James Stewart, *Calculus* (8th or 9th ed.) |
| Supporting math texts | *Mathematics for Machine Learning*; MIT 18.06; matrix-calculus paper |

### 3.1 Suggested 24-week calendar

| Week | Chapter | Focus |
|---|---|---|
| 1 | Ch. 1 | Orientation and the LLM pipeline |
| 2 | Ch. 2 | Functions, limits, definition of the derivative |
| 3 | Ch. 3 | Differentiation rules and the chain rule |
| 4 | Ch. 4 | Optimization in one variable |
| 5–6 | Ch. 5 | Multivariable calculus: gradients, Jacobians, Hessians |
| 7–8 | Ch. 6 | Linear algebra for neural networks |
| 9 | Ch. 7 | Probability, statistics, information theory |
| 10 | Ch. 8 | From linear models to neural networks |
| 11–12 | Ch. 9 | Backpropagation from scratch |
| 13 | Ch. 10 | Training neural networks |
| 14 | Ch. 11 | RNNs and backpropagation through time |
| 15 | Ch. 12 | LSTM |
| 16 | Ch. 13 | GRU |
| 17 | Ch. 14 | Seq2seq and attention before Transformers |
| 18 | Ch. 15 | The attention mechanism |
| 19–20 | Ch. 16 | The Transformer architecture |
| 21 | Ch. 17 | From Transformer to LLM |
| 22 | Ch. 18 | Capstone blueprint and final review |
| 23 | Ch. 19–20 | Causal LM data pipeline and numerical stability |
| 24 | Ch. 21 | Minimal viable LLM and final review |

Weeks 6, 8, 12, 16, 20, 22, and 24 include a cumulative review session.

### 3.2 Weekly rhythm

- **2 sessions:** new theory + worked examples.
- **1 session:** paper reading and note-taking.
- **1 session:** interactive exercises and derivation practice.
- **1 short session:** recall, error log, and review of previous chapters.

---

## 4. Mastery Standard

A chapter is complete only when the learner can do all four of the following
without notes:

1. **Explain** the core idea in plain language, with one analogy and one
   limitation of that analogy.
2. **Derive** the central equation or twice reproduce it from memory.
3. **Compute** a small numerical example by hand.
4. **Diagnose** a wrong result or a misleading intuition.

Each chapter ends with a mastery checklist. The learner marks a chapter complete
only after the checklist is satisfied. Scores are tracked locally; there is no
external grading.

### 4.1 Error log

Every incorrect exercise must be recorded with:

- the question,
- the learner's reasoning,
- the correct reasoning,
- the missing prerequisite,
- a scheduled review date.

This log is more important than the score.

---

## 5. Notation

| Symbol | Meaning |
|---|---|
| $x$, $y$ | scalar |
| $\mathbf{x}$, $\mathbf{y}$ | vector (column by default) |
| $X$, $W$ | matrix |
| $W_{ij}$ | entry at row $i$, column $j$ |
| $\mathbf{x}_t$ | input at time step $t$ |
| $\mathbf{h}_t$ | hidden state at time step $t$ |
| $\mathbf{c}_t$ | LSTM cell state at time step $t$ |
| $\sigma$ | logistic sigmoid, $\sigma(z)=1/(1+e^{-z})$ |
| $\tanh$ | hyperbolic tangent |
| $\odot$ | element-wise (Hadamard) product |
| $\nabla_\theta L$ | gradient of loss with respect to parameters |
| $\frac{\partial L}{\partial W}$ | partial derivative / gradient block |
| $d_k$ | key/query dimension in attention |
| $T$ | sequence length |
| $B$ | batch size |
| $V$ | vocabulary size |
| $d_{model}$ | Transformer hidden dimension |

Conventions:

- Vectors are columns unless explicitly transposed.
- A linear layer is $z = Wx + b$, with $W \in \mathbb{R}^{m \times n}$,
  $x \in \mathbb{R}^{n}$, $b \in \mathbb{R}^{m}$.
- Loss is averaged over a batch unless stated otherwise.
- Time indices run from $1$ to $T$.
- The guide uses "backpropagation" for the algorithm the original request called
  "backtracking"; search-style backtracking is out of scope.

---

## 6. Curriculum Map

| Ch. | Title | Mathematical core | Primary reading | Hours |
|---:|---|---|---|---:|
| 1 | Orientation | functions, composition, notation | DLB Ch. 1; Attention paper §1 | 4 |
| 2 | Functions, limits, derivative | limits, continuity, derivative as a limit | Stewart §1.1–1.5, §2.1–2.8 | 10 |
| 3 | Differentiation rules | product, quotient, chain rule | Stewart §3.1–3.6, §3.8–3.9 | 12 |
| 4 | One-variable optimization | extrema, Newton's method, descent | Stewart §4.1–4.4, §4.7–4.8 | 10 |
| 5 | Multivariable calculus | partials, gradient, Jacobian, Hessian | Stewart Ch. 14; matrix calculus §1–4 | 16 |
| 6 | Linear algebra | matrices, rank, eigen, SVD | MML Ch. 2–4; Strang 18.06 | 16 |
| 7 | Probability and information | distributions, MLE, entropy, KL | MML Ch. 6; DLB Ch. 3 | 14 |
| 8 | Neural network foundations | affine maps, activations, losses | DLB Ch. 4–5; Nielsen Ch. 1–2 | 12 |
| 9 | Backpropagation from scratch | computational graphs, VJP, chain rule | DLB Ch. 6; matrix calculus; Rumelhart 1986 | 20 |
| 10 | Training neural networks | SGD, Adam, normalization, regularization | DLB Ch. 7–8; Adam; LayerNorm | 18 |
| 11 | RNNs and BPTT | recurrence, gradient products | Bengio 1994; Pascanu 2013; DLB Ch. 10 | 16 |
| 12 | LSTM | gated memory, constant error carousel | Hochreiter & Schmidhuber 1997 | 14 |
| 13 | GRU | update/reset gates | Cho et al. 2014 | 10 |
| 14 | Seq2seq and attention | encoder–decoder, alignment | Sutskever 2014; Bahdanau 2014 | 12 |
| 15 | Attention mechanism | Q/K/V, softmax, multi-head | Attention paper §3.2 | 14 |
| 16 | Transformer architecture | blocks, residuals, positions, shapes | Attention paper; LayerNorm | 20 |
| 17 | Transformer to LLM | tokenization, decoding, scaling | GPT-3; scaling laws; word2vec | 16 |
| 18 | Capstone blueprint | design, budgets, evaluation | all of the above | 8 |
| 19 | Causal LM data pipeline | windows, shift, padding | guide Ch. 19; DLB Ch. 10 | 4 |
| 20 | Numerical stability | stable softmax/CE, clipping | guide Ch. 20; DLB Ch. 4 | 4 |
| 21 | Minimal viable LLM | minimal architecture and loop | guide Ch. 21; Ch. 16/18 | 4 |
| | **Total** | | | **254** |

---

# Part 0 — Orientation

## Chapter 1 — Orientation: What "From Scratch" Really Means

**Goal:** build an accurate map of the whole field before studying any single
piece, so that every later chapter has a place to attach to.

### Theory

- What an LLM is, mathematically: a parameterized function
  $f_\theta: \text{tokens} \to \text{probability distribution over next tokens}$.
- The end-to-end pipeline:
  text → tokenizer → token IDs → embedding matrix → Transformer blocks →
  final linear layer → logits → softmax → next-token distribution.
- The difference between a **language model**, a **Transformer**, and an **LLM**.
- The "from scratch" ladder:
  1. scalar automatic differentiation,
  2. a two-layer MLP trained on a toy problem,
  3. a character-level RNN,
  4. an LSTM/GRU,
  5. a single-block Transformer,
  6. a small decoder-only GPT-style model.
- The role of each mathematical discipline in the ladder.
- How to read a paper in three passes: title/abstract/figures, introduction and
  conclusions, then full derivation and appendices.
- How to keep a derivation notebook and an error log.

### Readings

- Goodfellow, Bengio, Courville, *Deep Learning*, Chapter 1.
- Vaswani et al., *Attention Is All You Need*, abstract and introduction.

### Interactive exercises

- **Pipeline map:** drag the stages (tokenizer, embedding, attention, softmax)
  into the correct order and reveal what each stage outputs.
- **Diagnostic quiz:** 10 questions to calibrate prior knowledge; results decide
  whether the learner starts at Chapter 2 or begins with an appendix refresher.
- **"What is from scratch?"** classify tasks as theory, implementation, or
  out of scope.

### Mastery checklist

- [ ] Draw the full text-to-next-token pipeline from memory.
- [ ] Explain the difference between training and inference.
- [ ] Explain why the chain rule is the central mathematical tool of the course.
- [ ] Set up the derivation notebook and error log.

**Estimated time:** 4 hours.

---

# Part I — Mathematical Foundations

> The mathematics part is deliberately complete enough that no later chapter
> needs to hand-wave a derivative, a matrix identity, or a probability formula.
> Stewart is the backbone for calculus; the other texts fill linear algebra,
> probability, and matrix calculus.

## Chapter 2 — Functions, Limits, Continuity, and the Derivative

**Goal:** understand the derivative as a limit and as a local linear
approximation, which is the conceptual root of all gradient-based learning.

### Theory

- Functions: domain, range, composition, inverse, even/odd symmetry,
  transformations, and families used in ML (polynomial, rational, exponential,
  logarithmic, logistic, trigonometric).
- Limits: intuitive definition, one-sided limits, infinite limits, limit laws,
  squeeze theorem, indeterminate forms, and techniques for algebraic
  simplification.
- Continuity: definition, types of discontinuity, intermediate value theorem.
- The derivative: difference quotient, limit definition, notation
  $f'(x), \frac{dy}{dx}, Df(x)$; differentiability implies continuity; tangent
  line and linearization $f(x) \approx f(a) + f'(a)(x-a)$.
- Why this matters: the derivative is the first-order sensitivity of a loss to a
  parameter; every later gradient is built from this operation.

### Stewart references

- §1.1–1.5: functions and models.
- §2.1–2.8: limits, continuity, limits at infinity, the derivative as a limit.
- Optional: §2.3 limit laws, §2.5 continuity, §2.7 derivatives and rates of
  change.

### Core readings

- Stewart, *Calculus*, Chapters 1–2.
- MML §5.1 for the machine-learning framing of derivatives.

### Interactive exercises

- **Function explorer:** change coefficients and see domain, range, asymptotes,
  and the shape of a family of functions.
- **Limit table:** move $x$ toward $a$ from both sides and watch the difference
  quotient converge.
- **Secant-to-tangent animation:** animate $h \to 0$ and show the secant line
  becoming the tangent line.
- **Continuity sorter:** classify graphs as continuous, removable, jump, or
  infinite discontinuity.
- **Derivative from definition:** numeric and symbolic answer checking for
  $f'(a) = \lim_{h\to 0} \frac{f(a+h)-f(a)}{h}$.

### Mastery checklist

- [ ] State the limit definition of the derivative.
- [ ] Compute a derivative from the definition for a polynomial and a rational
  function.
- [ ] Explain why differentiability implies continuity but not the converse.
- [ ] Use a tangent-line approximation and estimate its error.
- [ ] Explain the derivative as sensitivity to a small parameter change.

**Estimated time:** 10 hours.

---

## Chapter 3 — Differentiation Rules and the Chain Rule

**Goal:** become fluent with the rules that make differentiation mechanical, and
internalize the chain rule as composition of sensitivities.

### Theory

- Constant, power, sum, product, quotient rules.
- Derivatives of exponential, logarithmic, trigonometric, and inverse
  trigonometric functions.
- The chain rule in both forms:
  $\frac{d}{dx}f(g(x)) = f'(g(x))g'(x)$ and
  $\frac{dz}{dx} = \frac{dz}{dy}\frac{dy}{dx}$.
- Repeated composition: $f(g(h(x)))$ and the corresponding product of local
  derivatives.
- Implicit differentiation and logarithmic differentiation.
- Higher-order derivatives and notation $f''(x), f^{(n)}(x)$.
- Derivatives of the activation functions used later:
  - sigmoid: $\sigma'(z)=\sigma(z)(1-\sigma(z))$,
  - tanh: $\tanh'(z)=1-\tanh^2(z)$,
  - ReLU: derivative $1$ for $z>0$, $0$ for $z<0$, undefined at $0$,
  - softplus and GELU (preview).

### Stewart references

- §3.1–3.6: differentiation rules.
- §3.8–3.9: exponential/logarithmic differentiation and related rates.
- Optional: implicit differentiation §3.5 for inverse functions.

### Core readings

- Stewart, *Calculus*, Chapter 3.
- Matrix-calculus paper §2–3 (read after the scalar chain rule is solid).

### Interactive exercises

- **Chain-rule tree builder:** given a composite function, build the composition
  tree and multiply local derivatives at each node.
- **Derivative matching:** connect a function, its graph, and its derivative.
- **Activation derivative lab:** plot sigmoid, tanh, ReLU, GELU and their
  derivatives; observe saturation and dead zones.
- **Numeric vs symbolic check:** compute a derivative by hand, then verify with a
  central finite difference.

### Mastery checklist

- [ ] Differentiate every elementary function in the chapter without a table.
- [ ] Apply the chain rule to a three-level composition.
- [ ] Derive the sigmoid and tanh derivatives.
- [ ] Explain why a saturating activation produces a small gradient.
- [ ] Explain the chain rule as a product of local sensitivities.

**Estimated time:** 12 hours.

---

## Chapter 4 — Optimization in One Variable

**Goal:** understand how derivatives locate extrema and how iterative descent
finds minima, including its failure modes.

### Theory

- Absolute and local extrema; critical points; Fermat's theorem.
- Closed-interval method.
- First-derivative test and second-derivative test.
- Concavity, inflection points, and curve sketching.
- Asymptotes and limits at infinity.
- Newton's method for root finding:
  $x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}$.
- Gradient descent in one dimension:
  $x_{k+1}=x_k-\eta f'(x_k)$.
- Learning rate: too small, too large, oscillation, divergence.
- Local minima, flat regions, and the beginnings of saddle-point intuition.

### Stewart references

- §4.1–4.4: extrema, mean value theorem, derivative tests, curve sketching.
- §4.7–4.8: optimization problems and Newton's method.
- Optional: §4.4 L'Hôpital's rule if limits need review.

### Core readings

- Stewart, *Calculus*, Chapter 4.
- DLB §4.3 for the loss-surface perspective.

### Interactive exercises

- **1D descent lab:** choose a function, initial point, and learning rate; watch
  the sequence $x_k$ converge, oscillate, or diverge.
- **Newton vs gradient descent:** race both methods on the same function.
- **Critical-point finder:** click a graph to test whether a point is a maximum,
  minimum, or neither.
- **Learning-rate heatmap:** visualize final loss as a function of step size.
- **Loss-curve diagnostic:** given a training curve, identify instability,
  plateau, or overfitting.

### Mastery checklist

- [ ] Find all critical points and classify them.
- [ ] State the second-derivative test and its limitations.
- [ ] Derive the gradient-descent update for a quadratic loss.
- [ ] Explain divergence caused by a too-large learning rate.
- [ ] Use Newton's method and explain when it fails.

**Estimated time:** 10 hours.

---

## Chapter 5 — Multivariable Calculus: Gradients, Jacobians, Hessians

**Goal:** extend differentiation to vector-valued functions and derive the
objects that appear everywhere in deep learning.

### Theory

- Functions of several variables; domain; level curves and level surfaces.
- Partial derivatives and their geometric meaning.
- Tangent planes and total differential.
- Differentiability and the multivariable chain rule:
  $\frac{d}{dt}f(x(t),y(t)) = f_x x'(t) + f_y y'(t)$.
- Gradient:
  $\nabla f = \left(\frac{\partial f}{\partial x_1},\ldots,\frac{\partial f}{\partial x_n}\right)$.
- Directional derivative:
  $D_{\mathbf{u}}f = \nabla f \cdot \mathbf{u}$; the gradient points in the
  direction of steepest ascent.
- Maxima, minima, and saddle points; second-derivative test via the Hessian.
- Lagrange multipliers for constrained optimization (conceptual).
- Taylor expansion in several variables; first- and second-order approximations.
- Jacobian matrix for vector-valued functions:
  $J_{ij} = \frac{\partial f_i}{\partial x_j}$.
- Hessian matrix:
  $H_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$.
- Chain rule in matrix form:
  $\frac{\partial L}{\partial \mathbf{x}}
   = \left(\frac{\partial \mathbf{y}}{\partial \mathbf{x}}\right)^T
     \frac{\partial L}{\partial \mathbf{y}}$.
- Vector-Jacobian products (VJPs) and why reverse-mode autodiff is efficient.

### Stewart references

- §14.1–14.3: functions of several variables, limits, partial derivatives.
- §14.4–14.5: tangent planes, linear approximations, chain rule.
- §14.6: directional derivatives and the gradient.
- §14.7: maximum and minimum values.
- §14.8: Lagrange multipliers.
- Optional: §14.2 continuity for completeness.

### Core readings

- Stewart, *Calculus*, Chapter 14.
- Parr & Howard, *The Matrix Calculus You Need For Deep Learning*, §1–4.
- DLB §4.3.

### Interactive exercises

- **Contour map:** hover over a surface and see the gradient vector, its
  magnitude, and the local tangent plane.
- **Directional derivative dial:** rotate a unit vector and compare the
  directional derivative with $\nabla f \cdot \mathbf{u}$.
- **2D gradient descent:** drag the start point and learning rate on a contour
  plot.
- **Saddle-point explorer:** classify critical points from the Hessian
  determinant and eigenvalues.
- **Jacobian shape checker:** given a chain of functions, determine the shape of
  each Jacobian and the final VJP.
- **Matrix chain rule:** step through a small composition and build the VJP one
  factor at a time.

### Mastery checklist

- [ ] Compute partial derivatives and the gradient of a scalar function.
- [ ] Explain why the gradient is orthogonal to level sets.
- [ ] Classify critical points with the Hessian.
- [ ] Write the multivariable chain rule in both index and matrix form.
- [ ] Explain the difference between a Jacobian and a Hessian.
- [ ] Explain why reverse-mode differentiation is cheap for scalar losses.

**Estimated time:** 16 hours.

---

## Chapter 6 — Linear Algebra for Neural Networks

**Goal:** become fluent in the matrix and tensor operations that define layers,
embeddings, and attention.

### Theory

- Scalars, vectors, matrices, and tensors; shape conventions.
- Vector operations: addition, scalar multiplication, dot product, norms
  ($L_1$, $L_2$, $L_\infty$), cosine similarity, orthogonality.
- Matrix operations: addition, scalar multiplication, matrix–vector and
  matrix–matrix multiplication; composition of linear maps.
- Identity, transpose, inverse, orthogonal matrices, and why most weight matrices
  are not invertible.
- Rank, column space, null space, and linear independence.
- Systems of linear equations; least squares and the normal equations.
- Eigenvalues and eigenvectors; diagonalization; positive semi-definite matrices.
- Singular value decomposition (SVD): geometric interpretation and low-rank
  approximation.
- Broadcasting and shape rules; the meaning of a batch dimension.
- Einstein summation notation (conceptual introduction).
- Affine transformations: $y = Wx + b$; why the bias is necessary.
- Parameter counting for dense layers and attention.

### Core readings

- Deisenroth, Faisal, Ong, *Mathematics for Machine Learning*, Chapters 2–4.
- Strang, MIT 18.06 lectures and *Introduction to Linear Algebra* (selected
  chapters).
- DLB §2.1–2.12 as a reference.

### Interactive exercises

- **Matrix multiplication grid:** highlight row $i$ and column $j$ to compute one
  output entry.
- **Shape compatibility puzzle:** given a chain of operations, predict which
  products are valid and what the output shape is.
- **Linear map transformer:** apply a $2 \times 2$ matrix to a grid and observe
  rotation, scaling, shear, and reflection.
- **Eigenvector visualizer:** rotate a vector under a matrix and show directions
  that only scale.
- **SVD demo:** compress a small image or matrix with increasing rank.
- **Parameter counter:** configure layer sizes and see the exact parameter count.

### Mastery checklist

- [ ] Multiply matrices by hand and explain the row/column interpretation.
- [ ] Determine whether a matrix product is shape-valid.
- [ ] Explain rank and why low-rank structure matters.
- [ ] Compute eigenvalues of a $2 \times 2$ matrix.
- [ ] Explain the geometry of the SVD.
- [ ] Count parameters in an MLP and in an attention head.

**Estimated time:** 16 hours.

---

## Chapter 7 — Probability, Statistics, and Information Theory

**Goal:** understand language modeling as a probability problem and the loss
functions that follow from it.

### Theory

- Random variables, discrete and continuous.
- Probability mass/density functions, cumulative distributions.
- Joint, marginal, and conditional distributions; independence.
- Bayes' rule and Bayesian updating.
- Expectation, variance, covariance, correlation.
- Common distributions: Bernoulli, categorical, uniform, Gaussian, and the
  softmax parameterization of a categorical distribution.
- Law of large numbers and the central limit theorem (intuition and statement).
- Maximum likelihood estimation (MLE) and maximum a posteriori (MAP).
- Entropy:
  $H(p) = -\sum_x p(x)\log p(x)$.
- Cross-entropy:
  $H(p,q) = -\sum_x p(x)\log q(x)$.
- KL divergence:
  $D_{KL}(p\|q) = \sum_x p(x)\log\frac{p(x)}{q(x)}$.
- Why minimizing cross-entropy is equivalent to minimizing KL divergence when
  $p$ is fixed.
- Softmax, logits, temperature, and sampling from a categorical distribution.
- Bias–variance decomposition (preview for Chapter 10).

### Core readings

- MML Chapter 6.
- DLB Chapter 3.
- Nielsen, *Neural Networks and Deep Learning*, Chapter 3 (optional, for a
  different explanation of cross-entropy).

### Interactive exercises

- **Distribution explorer:** change parameters of Bernoulli, categorical, and
  Gaussian distributions and see mean/variance.
- **Bayes update:** start with a prior, observe evidence, and watch the posterior
  update.
- **Softmax lab:** change logits and temperature; see the resulting probabilities
  and entropy.
- **Cross-entropy calculator:** compare a true distribution and a predicted
  distribution; show cross-entropy and KL divergence.
- **Sampling demo:** sample tokens from a categorical distribution to see how
  temperature changes diversity.
- **MLE derivation:** step through the log-likelihood derivation for a Bernoulli
  model.

### Mastery checklist

- [ ] State Bayes' rule and apply it to a small example.
- [ ] Compute expectation and variance for a discrete distribution.
- [ ] Derive the softmax from the categorical likelihood.
- [ ] Derive cross-entropy from maximum likelihood.
- [ ] Explain the relationship between cross-entropy and KL divergence.
- [ ] Explain what temperature does to a token distribution.

**Estimated time:** 14 hours.

---

# Part II — Neural Networks and Backpropagation

## Chapter 8 — From Linear Models to Neural Networks

**Goal:** build the simplest models that learn, then see exactly what a
nonlinearity adds.

### Theory

- Linear regression: model, MSE loss, closed-form solution, gradient descent
  solution.
- Logistic regression: sigmoid, log-odds interpretation, cross-entropy loss.
- Perceptron and its limitations.
- Multilayer perceptron (MLP):
  $\mathbf{h} = f(W_1\mathbf{x}+\mathbf{b}_1)$,
  $\hat{\mathbf{y}} = g(W_2\mathbf{h}+\mathbf{b}_2)$.
- Activation functions: sigmoid, tanh, ReLU, Leaky ReLU, GELU, Swish; saturation,
  dead units, smoothness.
- Universal approximation theorem: statement, intuition, and what it does *not*
  guarantee (learnability, sample efficiency, generalization).
- Depth vs width; representation power; compositional structure.
- Loss functions: MSE, MAE, cross-entropy, binary cross-entropy.
- Decision boundaries and representation learning.

### Core readings

- DLB Chapters 4–5.
- Nielsen, Chapters 1–2.
- MML Chapter 5.

### Interactive exercises

- **Linear vs logistic boundary:** move a decision boundary and see the effect on
  loss.
- **Activation playground:** compose multiple activations and visualize the
  resulting function.
- **MLP function approximator:** fit a 1D target with one hidden layer and vary
  the number of units.
- **Universal approximation demo:** increase hidden units and watch the
  approximation error fall.
- **Loss landscape:** compare MSE and cross-entropy gradients for a
  misclassified example.

### Mastery checklist

- [ ] Derive the gradient of MSE for linear regression.
- [ ] Derive logistic regression's cross-entropy gradient.
- [ ] Explain why a linear model cannot solve XOR.
- [ ] State the universal approximation theorem and its limitations.
- [ ] Choose an activation function and justify the choice.

**Estimated time:** 12 hours.

---

## Chapter 9 — Backpropagation from Scratch

**Goal:** derive backpropagation completely, from a scalar computational graph to
vectorized matrix formulas, and understand why it is reverse-mode automatic
differentiation.

### Theory

- Computation as a directed acyclic graph (DAG).
- Forward pass: compute and cache intermediate values.
- Reverse pass: local derivative at each node, chain rule, accumulation.
- Topological ordering and the reverse traversal.
- Scalar example: $L = (wx+b-y)^2$ derived node by node.
- Vector example: a two-layer MLP with ReLU and softmax cross-entropy.
- Matrix backpropagation:
  - $\delta^{(l)} = (W^{(l+1)})^T\delta^{(l+1)} \odot f'(z^{(l)})$,
  - $\frac{\partial L}{\partial W^{(l)}} = \delta^{(l)}(a^{(l-1)})^T$,
  - $\frac{\partial L}{\partial b^{(l)}} = \delta^{(l)}$.
- Softmax + cross-entropy gradient:
  $\frac{\partial L}{\partial z} = \hat{y} - y$.
- Gradient accumulation for shared parameters.
- Vector-Jacobian products (VJPs) and why reverse mode costs roughly one forward
  pass plus one reverse pass.
- Numerical gradient checking with central differences.
- Numerical stability: log-sum-exp, avoiding overflow in softmax, log-space
  cross-entropy.
- Vanishing and exploding gradients as products of many local derivatives.
- Autodiff vs symbolic differentiation vs numerical differentiation.
- The difference between a gradient and a parameter update.

### Core readings

- DLB Chapter 6.
- Nielsen, Chapter 2.
- Parr & Howard, *The Matrix Calculus You Need For Deep Learning*.
- Rumelhart, Hinton & Williams (1986), *Learning representations by
  back-propagating errors*.

### Interactive exercises

- **Step-through graph:** forward values are shown; the learner selects the local
  derivative at each node, then the reverse pass multiplies them.
- **Local-gradient quiz:** given a node type (add, multiply, ReLU, sigmoid,
  softmax), choose the correct local derivative.
- **Manual vs autodiff:** compute a small gradient by hand and compare with the
  guide's reverse-mode result.
- **Gradient-check lab:** perturb one parameter and compare analytic and numerical
  gradients; flag mismatches.
- **Shape debugger:** given a broken backprop implementation, find the shape or
  transpose error.
- **Depth experiment:** increase network depth and watch gradient magnitude decay
  or explode.

### Mastery checklist

- [ ] Draw the computational graph for a two-layer MLP.
- [ ] Derive every local derivative in that graph.
- [ ] Write the vectorized backward pass for a dense layer.
- [ ] Derive the softmax + cross-entropy gradient.
- [ ] Explain why gradients accumulate when parameters are shared.
- [ ] Perform a gradient check and interpret a mismatch.
- [ ] Explain reverse-mode autodiff in one paragraph.

**Estimated time:** 20 hours.

---

## Chapter 10 — Training Neural Networks

**Goal:** understand the optimization, initialization, normalization, and
regularization choices that make deep networks trainable.

### Theory

- Empirical risk minimization; training, validation, and test splits.
- Bias–variance trade-off; overfitting and underfitting.
- Stochastic gradient descent and mini-batches; shuffling; epochs.
- Momentum and Nesterov momentum.
- AdaGrad, RMSProp, and Adam:
  - first and second moment estimates,
  - bias correction,
  - why Adam is a common default.
- Learning-rate schedules: step decay, cosine decay, warmup, one-cycle.
- Initialization: zero init failure, Xavier/Glorot, He initialization; variance
  preservation.
- Normalization:
  - batch normalization and its train/inference behavior,
  - layer normalization and why Transformers use it.
- Regularization: weight decay, dropout, early stopping, data augmentation,
  label smoothing.
- Hyperparameter search: grid, random, and Bayesian (conceptual).
- Debugging training: loss not decreasing, loss exploding, overfitting,
  underfitting, dead ReLUs, bad learning rate.
- Reproducibility and experiment tracking.

### Core readings

- DLB Chapters 7–8.
- Kingma & Ba (2014), *Adam*.
- Ba, Kiros & Hinton (2016), *Layer Normalization*.
- Ioffe & Szegedy (2015), *Batch Normalization*.

### Interactive exercises

- **Optimizer race:** SGD, momentum, RMSProp, and Adam on the same loss surface.
- **Learning-rate lab:** sweep the learning rate and classify the resulting
  behavior.
- **Initialization lab:** compare zero, Xavier, and He initialization by gradient
  variance across layers.
- **Regularization lab:** toggle dropout and weight decay; watch train/validation
  curves.
- **Normalization explorer:** compare no normalization, batch norm, and layer norm
  on activation distributions.
- **Debug the run:** diagnose a synthetic training log.

### Mastery checklist

- [ ] Explain the difference between batch, stochastic, and mini-batch gradient
  descent.
- [ ] Write the Adam update equations.
- [ ] Explain why zero initialization fails in a deep network.
- [ ] Explain the difference between batch norm and layer norm.
- [ ] Choose a regularization strategy for a given failure mode.
- [ ] Diagnose underfitting vs overfitting from learning curves.

**Estimated time:** 18 hours.

---

# Part III — Sequence Models

## Chapter 11 — Recurrent Neural Networks and Backpropagation Through Time

**Goal:** understand recurrence as parameter sharing across time and derive why
gradients through long sequences are fragile.

### Theory

- Sequences as functions of time; variable-length inputs.
- RNN recurrence:
  $\mathbf{h}_t = \tanh(W_h\mathbf{h}_{t-1} + W_x\mathbf{x}_t + \mathbf{b}_h)$,
  $\hat{\mathbf{y}}_t = W_y\mathbf{h}_t + \mathbf{b}_y$.
- Parameter sharing across time steps; the same $W_h$ applied repeatedly.
- Unrolling the network into a deep computational graph.
- Backpropagation through time (BPTT):
  $\frac{\partial L}{\partial \mathbf{h}_t}
   = \frac{\partial L_t}{\partial \mathbf{h}_t}
     + \left(\frac{\partial \mathbf{h}_{t+1}}{\partial \mathbf{h}_t}\right)^T
       \frac{\partial L}{\partial \mathbf{h}_{t+1}}$.
- The gradient product:
  $\frac{\partial \mathbf{h}_T}{\partial \mathbf{h}_1}
   = \prod_{t=2}^{T}\frac{\partial \mathbf{h}_t}{\partial \mathbf{h}_{t-1}}$.
- Vanishing gradients when the product's norm shrinks exponentially.
- Exploding gradients when the product's norm grows exponentially.
- Spectral radius of the recurrent Jacobian; necessary conditions for stable
  dynamics.
- Gradient clipping (norm clipping and value clipping).
- Truncated BPTT and its trade-offs.
- Teacher forcing and exposure bias.
- Bidirectional RNNs and Elman/Jordan variants.
- Why long-range dependencies are hard for a plain RNN.

### Core readings

- Bengio, Simard & Frasconi (1994), *Learning long-term dependencies with
  gradient descent is difficult*.
- Pascanu, Mikolov & Bengio (2013), *On the difficulty of training recurrent
  neural networks*.
- DLB Chapter 10.
- Rumelhart et al. (1986), for the original backpropagation idea.

### Interactive exercises

- **Unrolled RNN:** step forward and backward through time; inspect
  $\mathbf{h}_t$ and the accumulated gradient.
- **Gradient-flow slider:** change the recurrent weight's magnitude and watch the
  product of Jacobians grow or shrink over $T$ steps.
- **Vanishing/exploding demo:** plot gradient norm vs sequence length for
  different spectral radii.
- **Clipping lab:** apply gradient clipping and observe training stability.
- **Sequence prediction toy:** fit a tiny recurrence to a periodic sequence and
  observe what it memorizes.

### Mastery checklist

- [ ] Write the RNN forward equations from memory.
- [ ] Unroll an RNN for three time steps and draw the graph.
- [ ] Derive the BPTT recursion.
- [ ] Explain vanishing and exploding gradients with the product of Jacobians.
- [ ] Explain what gradient clipping does and does not fix.
- [ ] Explain the trade-offs of truncated BPTT.

**Estimated time:** 16 hours.

---

## Chapter 12 — Long Short-Term Memory (LSTM)

**Goal:** understand the original LSTM as a carefully designed solution to the
vanishing-gradient problem, including every gate and the cell state.

### Theory

- Motivation: preserving information across many time steps.
- The constant error carousel: why an additive cell-state path helps gradients
  flow.
- LSTM components:
  - forget gate,
  - input gate,
  - candidate cell state,
  - output gate,
  - cell state and hidden state.
- Forward equations (one common formulation):
  - $\mathbf{f}_t = \sigma(W_f[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_f)$,
  - $\mathbf{i}_t = \sigma(W_i[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_i)$,
  - $\tilde{\mathbf{c}}_t = \tanh(W_c[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_c)$,
  - $\mathbf{c}_t = \mathbf{f}_t\odot\mathbf{c}_{t-1}
                   + \mathbf{i}_t\odot\tilde{\mathbf{c}}_t$,
  - $\mathbf{o}_t = \sigma(W_o[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_o)$,
  - $\mathbf{h}_t = \mathbf{o}_t\odot\tanh(\mathbf{c}_t)$.
- Peephole connections and other variants.
- Gradient flow through the cell state: why the additive path avoids repeated
  multiplication by the recurrent weight.
- What LSTM does not solve: very long dependencies, computational cost,
  interpretability.
- Layer-normalized LSTM (optional preview).

### Core readings

- Hochreiter & Schmidhuber (1997), *Long Short-Term Memory*.
- DLB Chapter 10.
- Olah, *Understanding LSTM Networks* (online article, optional intuition).

### Interactive exercises

- **Gate simulator:** set forget/input/output gate values and watch the cell
  state and hidden state evolve.
- **Memory timeline:** feed a sequence with a delayed cue and see which gate
  preserves it.
- **Gate ablation:** force one gate open or closed and compare behavior.
- **Gradient path comparison:** RNN vs LSTM gradient flow over $T$ steps.
- **Equation builder:** drag gate outputs into the correct positions in the
  update equations.

### Mastery checklist

- [ ] Write all six LSTM forward equations from memory.
- [ ] Explain the role of each gate.
- [ ] Explain why the cell state is additive.
- [ ] Trace a gradient through the cell state for several steps.
- [ ] Explain the limitations of LSTM.

**Estimated time:** 14 hours.

---

## Chapter 13 — Gated Recurrent Unit (GRU)

**Goal:** understand the GRU as a simpler gated alternative to the LSTM and
compare their design trade-offs from the literature.

### Theory

- Motivation: reduce LSTM complexity while retaining gating.
- Update gate and reset gate.
- Forward equations (one common formulation):
  - $\mathbf{z}_t = \sigma(W_z[\mathbf{h}_{t-1},\mathbf{x}_t])$,
  - $\mathbf{r}_t = \sigma(W_r[\mathbf{h}_{t-1},\mathbf{x}_t])$,
  - $\tilde{\mathbf{h}}_t = \tanh(W_h[\mathbf{r}_t\odot\mathbf{h}_{t-1},\mathbf{x}_t])$,
  - $\mathbf{h}_t = (1-\mathbf{z}_t)\odot\mathbf{h}_{t-1}
                   + \mathbf{z}_t\odot\tilde{\mathbf{h}}_t$.
- How the update gate interpolates between old and new state.
- How the reset gate controls how much past state contributes to the candidate.
- Relationship to LSTM: no separate cell state; fewer parameters.
- Empirical comparisons and when each architecture is preferred.
- Limitations shared with all recurrent models: sequential computation,
  fixed-size state, difficulty with very long context.

### Core readings

- Cho et al. (2014), *Learning Phrase Representations using RNN Encoder–Decoder
  for Statistical Machine Translation*.
- DLB Chapter 10.
- Optional: Chung et al. (2014), *Empirical Evaluation of Gated Recurrent Neural
  Networks on Sequence Modeling*.

### Interactive exercises

- **GRU vs LSTM side-by-side:** same input sequence, compare state trajectories
  and parameter counts.
- **Gate calculator:** compute $\mathbf{z}_t$, $\mathbf{r}_t$, and
  $\mathbf{h}_t$ for a small numeric example.
- **Reset-gate lab:** see how resetting memory changes the candidate state.
- **Parameter counter:** compare LSTM and GRU for the same hidden size.

### Mastery checklist

- [ ] Write the GRU forward equations from memory.
- [ ] Explain the difference between the update and reset gates.
- [ ] Compare GRU and LSTM parameter counts.
- [ ] Explain when a GRU may be preferable.
- [ ] State the shared limitations of recurrent models.

**Estimated time:** 10 hours.

---

## Chapter 14 — Sequence-to-Sequence and the Road to Attention

**Goal:** understand the encoder–decoder framework, the fixed-context
bottleneck, and why attention was introduced before Transformers.

### Theory

- Sequence-to-sequence tasks: translation, summarization, dialogue.
- Encoder–decoder architecture.
- The fixed-size context vector as a bottleneck.
- Sutskever et al. (2014): LSTM encoder–decoder, reversing the input sequence,
  beam search.
- Bahdanau et al. (2014): additive attention, alignment scores, context vector as
  a weighted sum of encoder states.
- Attention weights and alignment matrices.
- Teacher forcing, exposure bias, and scheduled sampling.
- Beam search: scoring, beam width, length normalization.
- Why attention improves long-sequence performance.
- The conceptual leap from recurrent attention to self-attention.
- Word embeddings and the distributional hypothesis (word2vec).

### Core readings

- Sutskever, Vinyals & Le (2014), *Sequence to Sequence Learning with Neural
  Networks*.
- Bahdanau, Cho & Bengio (2014), *Neural Machine Translation by Jointly Learning
  to Align and Translate*.
- Mikolov et al. (2013), *Efficient Estimation of Word Representations in Vector
  Space*.

### Interactive exercises

- **Bottleneck demo:** compress a long source sentence into one vector and observe
  information loss.
- **Alignment heatmap:** adjust attention scores and see the resulting context
  vector.
- **Beam search tree:** expand a beam and compare hypotheses.
- **Teacher-forcing simulator:** compare training-time and inference-time inputs.
- **Embedding explorer:** show nearest neighbors in a small embedding space.

### Mastery checklist

- [ ] Draw an encoder–decoder architecture.
- [ ] Explain the fixed-context bottleneck.
- [ ] Write the Bahdanau attention score and context vector.
- [ ] Explain teacher forcing and exposure bias.
- [ ] Explain why attention motivates self-attention.

**Estimated time:** 12 hours.

---

# Part IV — Transformers

## Chapter 15 — The Attention Mechanism

**Goal:** derive scaled dot-product attention and multi-head attention from first
principles, with full control over shapes and masks.

### Theory

- Attention as soft retrieval: a query asks, keys are matched, values are read.
- Queries, keys, and values:
  $Q = XW_Q$, $K = XW_K$, $V = XW_V$.
- Scaled dot-product attention:
  $\text{Attention}(Q,K,V)
   = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$.
- Why divide by $\sqrt{d_k}$: variance of dot products grows with dimension;
  scaling keeps softmax in a stable range.
- Softmax over the key dimension; row-stochastic attention weights.
- Padding masks and causal masks.
- Multi-head attention:
  $\text{MultiHead}(Q,K,V)
   = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W_O$.
- Self-attention vs cross-attention.
- Permutation equivariance and why positional information is needed.
- Computational complexity $O(n^2 d)$ and memory cost.
- Attention as a weighted average of values; interpreting attention weights.
- Gradient flow through attention (conceptual).

### Core readings

- Vaswani et al. (2017), *Attention Is All You Need*, §3.2 and §3.3.
- Rush et al., *The Annotated Transformer* (optional, implementation-oriented).
- DLB Chapter 10 for the sequence-model context.

### Interactive exercises

- **QKV calculator:** enter small matrices and compute attention step by step.
- **Attention heatmap:** edit queries/keys and see the softmax weights.
- **Causal mask lab:** toggle a causal mask and observe which positions can attend
  to which.
- **Scaling demo:** compare softmax entropy with and without $\sqrt{d_k}$.
- **Multi-head explorer:** split dimensions into heads and compare their attention
  patterns.
- **Complexity lab:** plot attention cost vs sequence length.

### Mastery checklist

- [ ] Write the scaled dot-product attention formula from memory.
- [ ] Explain the role of $Q$, $K$, and $V$.
- [ ] Explain why scaling by $\sqrt{d_k}$ is necessary.
- [ ] Apply a causal mask correctly.
- [ ] Write the multi-head attention formula and trace all shapes.
- [ ] Explain why attention alone is permutation-equivariant.

**Estimated time:** 14 hours.

---

## Chapter 16 — The Transformer Architecture

**Goal:** understand every component of the original Transformer and trace a
batch of tokens through the full encoder–decoder stack.

### Theory

- Overall architecture from *Attention Is All You Need*:
  - encoder stack,
  - decoder stack,
  - multi-head self-attention,
  - masked self-attention in the decoder,
  - encoder–decoder cross-attention,
  - position-wise feed-forward networks,
  - residual connections,
  - layer normalization,
  - dropout,
  - final linear + softmax.
- Positional encoding:
  - sinusoidal encoding,
  - why positions are added rather than concatenated,
  - learned positional embeddings as an alternative,
  - extrapolation limitations.
- Feed-forward block:
  $\text{FFN}(x)=\max(0,xW_1+b_1)W_2+b_2$ and modern variants (GELU, SwiGLU).
- Residual connections and gradient flow.
- Layer normalization: pre-norm vs post-norm; why modern LLMs usually use
  pre-norm.
- Weight tying between input embeddings and output projection.
- Shape flow through a decoder-only block (batch, sequence, hidden dimension,
  heads).
- Parameter counting.
- Training details from the paper: Adam with warmup, label smoothing, dropout.
- Encoder-only, decoder-only, and encoder–decoder families.
- Why the Transformer replaced recurrence: parallelism and long-range routing.

### Core readings

- Vaswani et al. (2017), *Attention Is All You Need* (full paper).
- Ba, Kiros & Hinton (2016), *Layer Normalization*.
- Rush et al., *The Annotated Transformer* (optional).
- DLB Chapter 10 for background.

### Interactive exercises

- **Architecture walkthrough:** click any block and see its inputs, outputs, and
  shapes.
- **Shape tracer:** follow a tensor of shape $(B,T,d_{model})$ through every
  operation; catch the first invalid shape.
- **Positional encoding heatmap:** change sequence length and dimension; inspect
  the sinusoids.
- **Residual/layer-norm toggle:** compare gradient flow with and without residual
  connections.
- **Parameter calculator:** configure $d_{model}$, heads, layers, and vocabulary;
  see the total parameter count.
- **Full forward pass:** step through a toy sequence and inspect logits at each
  position.

### Mastery checklist

- [ ] Draw the original Transformer encoder and decoder blocks.
- [ ] Explain the purpose of each sublayer.
- [ ] Write the sinusoidal positional encoding.
- [ ] Explain pre-norm vs post-norm.
- [ ] Trace shapes through a decoder-only block.
- [ ] Count parameters in a Transformer block.
- [ ] Explain why the architecture is parallelizable during training.

**Estimated time:** 20 hours.

---

## Chapter 17 — From Transformer to LLM

**Goal:** connect the architecture to the practical definition of a large
language model: tokenization, next-token prediction, decoding, scaling, and
evaluation.

### Theory

- Tokenization:
  - character, word, and subword tokenization,
  - byte-pair encoding (BPE), WordPiece, SentencePiece,
  - vocabulary size and its trade-offs,
  - special tokens.
- Embeddings and the embedding matrix.
- Causal language modeling:
  $p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t})$.
- Next-token prediction loss (cross-entropy over the vocabulary).
- Decoder-only GPT-style architecture.
- Context window and attention masks.
- Decoding strategies:
  - greedy,
  - beam search,
  - temperature sampling,
  - top-$k$ and top-$p$ (nucleus) sampling,
  - repetition penalties (conceptual).
- KV cache and inference efficiency.
- Pretraining, supervised fine-tuning, and RLHF (high-level overview only).
- Scaling laws:
  - loss as a function of parameters, data, and compute,
  - compute-optimal allocation,
  - why data quality and token count matter.
- GPT-1, GPT-2, and GPT-3 as milestones.
- Evaluation: perplexity, task accuracy, benchmarks, contamination, and
  limitations.
- Compute and memory budgeting (conceptual).
- Ethics and safety: bias, hallucination, data provenance, licensing.

### Core readings

- Vaswani et al. (2017), *Attention Is All You Need*.
- Brown et al. (2020), *Language Models are Few-Shot Learners* (GPT-3).
- Kaplan et al. (2020), *Scaling Laws for Neural Language Models*.
- Mikolov et al. (2013), *Efficient Estimation of Word Representations in Vector
  Space*.
- Optional: Radford et al. (2019), *GPT-2*.

### Interactive exercises

- **Tokenizer playground:** compare character, word, and BPE tokenizations on the
  same text.
- **Next-token distribution:** given a context, inspect the top logits and
  probabilities.
- **Sampling lab:** compare greedy, temperature, top-$k$, and top-$p$ on the same
  distribution.
- **Scaling-law plot:** change parameters, data, and compute and see predicted
  loss.
- **KV-cache demo:** show which keys/values are reused during generation.
- **Context-window visualizer:** see how the attention mask grows with context.

### Mastery checklist

- [ ] Write the autoregressive factorization of a sequence probability.
- [ ] Explain BPE at a conceptual level.
- [ ] Derive the next-token cross-entropy loss.
- [ ] Compare greedy, beam, and nucleus sampling.
- [ ] Explain what a KV cache stores and why it helps.
- [ ] Interpret a scaling-law curve.
- [ ] Explain the difference between pretraining and fine-tuning.

**Estimated time:** 16 hours.

---

# Part V — Capstone Blueprint

## Chapter 18 — Capstone Blueprint: Design Your LLM (No Code Yet)

**Goal:** produce a complete written design for the later implementation phase,
without writing implementation code.

### Theory and deliverables

- Choose a target scale:
  - character-level tiny GPT (~1–10M parameters),
  - small BPE-based GPT (~10–50M parameters),
  - or a deliberately tiny educational model for CPU training.
- Dataset selection and licensing.
- Tokenizer choice and vocabulary size.
- Architecture configuration:
  - number of layers,
  - $d_{model}$,
  - number of heads,
  - context length,
  - feed-forward multiplier,
  - dropout,
  - normalization placement.
- Training plan:
  - loss,
  - optimizer and schedule,
  - batch size and gradient accumulation,
  - evaluation intervals,
  - checkpointing.
- Compute and memory budget estimate.
- Evaluation plan:
  - validation loss/perplexity,
  - sample generations,
  - ablation studies.
- Risk register: overfitting, data leakage, unstable training, tokenizer bugs,
  evaluation contamination.
- Reproducibility plan: seeds, config files, environment notes.
- The implementation ladder, restated as milestones:
  1. scalar autodiff engine,
  2. MLP,
  3. RNN,
  4. LSTM/GRU,
  5. single Transformer block,
  6. mini GPT,
  7. training and sampling.
- A written "architecture decision record" for each major choice.

### Interactive exercises

- **Architecture configurator:** choose layers, width, heads, and context; see
  parameter count and estimated compute.
- **Budget estimator:** input hardware and time; estimate feasible model size.
- **Milestone planner:** order the implementation ladder and attach a deliverable
  to each step.
- **Design review checklist:** self-assess the capstone document against a rubric.

### Mastery checklist

- [ ] Write a complete architecture specification.
- [ ] Justify every hyperparameter choice.
- [ ] Estimate parameter count and training cost.
- [ ] Define evaluation criteria before training.
- [ ] Identify the top five risks and mitigations.
- [ ] Produce a milestone plan for the implementation phase.

**Estimated time:** 8 hours.

---

# Part VI — Minimal LLM Bridge

> This part closes the gap between the theory guide and a first manual
> implementation. It does not implement the model; it defines the minimum data,
> numerical, and training loops required for a small working LLM.

## Chapter 19 — Causal Language Modeling Data Pipeline

**Goal:** turn a token corpus into correctly shifted input/target batches.

### Theory

- Tokenization output as one long sequence of IDs.
- Context windows of length $T$ and the need for $T+1$ tokens.
- Input $[c_i,\ldots,c_{i+T-1}]$ and target $[c_{i+1},\ldots,c_{i+T}]$.
- Non-overlapping vs sliding windows; packing documents.
- Batching to $(B,T)$; padding and ignore-index labels.
- Train/validation splits at document level; tokenizer fitted on training data only.

### Lab and mastery

- Interactive window builder.
- Checklist: shift explanation, window construction, padding, leakage, batch shapes.

**Estimated time:** 4 hours.

## Chapter 20 — Numerical Stability for LLM Training

**Goal:** implement softmax, cross-entropy, and updates without overflow,
underflow, or silent NaNs.

### Theory

- Floating-point exponent limits and failure modes.
- Stable softmax: subtract the maximum logit.
- Log-sum-exp and stable cross-entropy: $\operatorname{logsumexp}(z)-z_c$.
- Masking caveats: avoid all-masked rows.
- Gradient clipping and NaN/Inf assertions in the training loop.

### Lab and mastery

- Stable-vs-naive softmax table with safe, overflow, and underflow presets.
- Checklist: stable formulas, clipping, finite-gradient checks.

**Estimated time:** 4 hours.

## Chapter 21 — The Minimal Viable LLM

**Goal:** define the smallest complete loop that trains and generates.

### Theory

- Success criteria: decreasing loss, finite validation loss, overfit one batch,
  coherent samples, reproducibility.
- Minimal architecture: character-level tokenizer, 2–4 layers, $d=64$–$128$,
  2–4 heads, context 64–128, FFN $4d$, pre-norm LayerNorm.
- Six-step loop: windows, forward, stable loss, backward, clip/update, evaluate.
- Debug triage: stuck loss, NaN loss, overfitting, garbage samples, failure to
  overfit a batch.
- Milestones: overfit one batch, tiny corpus, coherent samples, validation,
  then scale.

### Lab and mastery

- Worked example sizing a 0.106M-parameter model.
- Quiz on scope and debugging.
- Checklist: success criteria, architecture, loop, failure modes.

**Estimated time:** 4 hours.

---

# Appendices

## Appendix A — Core Formula Sheet

### Calculus and optimization

$$
f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}
$$

$$
\frac{d}{dx}f(g(x))=f'(g(x))g'(x)
$$

$$
\nabla_\theta L=\left(\frac{\partial L}{\partial \theta_1},\ldots,\frac{\partial L}{\partial \theta_n}\right)
$$

$$
\theta_{k+1}=\theta_k-\eta\nabla_\theta L(\theta_k)
$$

### Linear layers and losses

$$
\mathbf{z}=W\mathbf{x}+\mathbf{b}
$$

$$
\text{softmax}(\mathbf{z})_i=\frac{e^{z_i}}{\sum_j e^{z_j}}
$$

$$
L_{\text{CE}}=-\sum_i y_i\log \hat{y}_i
$$

### Backpropagation

$$
\delta^{(l)}=(W^{(l+1)})^T\delta^{(l+1)}\odot f'(z^{(l)})
$$

$$
\frac{\partial L}{\partial W^{(l)}}=\delta^{(l)}(a^{(l-1)})^T
$$

$$
\frac{\partial L}{\partial \mathbf{b}^{(l)}}=\delta^{(l)}
$$

### Recurrent models

$$
\mathbf{h}_t=\tanh(W_h\mathbf{h}_{t-1}+W_x\mathbf{x}_t+\mathbf{b}_h)
$$

$$
\frac{\partial \mathbf{h}_T}{\partial \mathbf{h}_1}
=\prod_{t=2}^{T}\frac{\partial \mathbf{h}_t}{\partial \mathbf{h}_{t-1}}
$$

LSTM:

$$
\mathbf{f}_t=\sigma(W_f[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_f),\quad
\mathbf{i}_t=\sigma(W_i[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_i)
$$

$$
\mathbf{c}_t=\mathbf{f}_t\odot\mathbf{c}_{t-1}
+\mathbf{i}_t\odot\tanh(W_c[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_c)
$$

$$
\mathbf{o}_t=\sigma(W_o[\mathbf{h}_{t-1},\mathbf{x}_t]+\mathbf{b}_o),\quad
\mathbf{h}_t=\mathbf{o}_t\odot\tanh(\mathbf{c}_t)
$$

GRU:

$$
\mathbf{z}_t=\sigma(W_z[\mathbf{h}_{t-1},\mathbf{x}_t]),\quad
\mathbf{r}_t=\sigma(W_r[\mathbf{h}_{t-1},\mathbf{x}_t])
$$

$$
\mathbf{h}_t=(1-\mathbf{z}_t)\odot\mathbf{h}_{t-1}
+\mathbf{z}_t\odot\tanh(W_h[\mathbf{r}_t\odot\mathbf{h}_{t-1},\mathbf{x}_t])
$$

### Attention and Transformer

$$
\text{Attention}(Q,K,V)=\text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

$$
\text{MultiHead}(Q,K,V)=\text{Concat}(\text{head}_1,\ldots,\text{head}_h)W_O
$$

$$
\text{head}_i=\text{Attention}(QW_Q^i,KW_K^i,VW_V^i)
$$

Sinusoidal positional encoding:

$$
PE_{(pos,2i)}=\sin\left(\frac{pos}{10000^{2i/d_{model}}}\right),\quad
PE_{(pos,2i+1)}=\cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)
$$

Autoregressive factorization:

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t})
$$

---

## Appendix B — Stewart Calculus Map

| Volume | Stewart chapter | Topic | Used in |
|---|---|---|---|
| Vol. 1 | Ch. 1 | Functions and models | Ch. 2 |
| Vol. 1 | Ch. 2 | Limits and derivatives | Ch. 2 |
| Vol. 1 | Ch. 3 | Differentiation rules | Ch. 3 |
| Vol. 1 | Ch. 4 | Applications of differentiation | Ch. 4 |
| Vol. 2 | Ch. 11 | Infinite sequences and series (optional) | Ch. 7, scaling intuition |
| Vol. 2 | Ch. 12 | Vectors and the geometry of space | Ch. 6 |
| Vol. 2 | Ch. 14 | Partial derivatives | Ch. 5, 8, 9 |
| Vol. 2 | Ch. 15 | Multiple integrals (optional) | probability intuition |

The learner's local study copies are *Cálculo, Volume 1* and *Cálculo, Volume 2*
(Stewart, 7th Brazilian edition), kept outside this repository. Section numbering
is stable across recent editions; if a section is missing, use the index to
locate the same topic.

---

## Appendix C — Paper Reading Protocol

For every primary source, use three passes.

**Pass 1 — Orientation (20–30 min):**
- Read title, abstract, introduction, figures, and conclusion.
- Write one sentence: what problem does this paper solve?
- Write one sentence: what is the main mechanism?

**Pass 2 — Structure (45–60 min):**
- Read section headings and topic sentences.
- Identify the mathematical objects and their shapes.
- Write the central equation or algorithm from the paper.
- List three questions you cannot answer yet.

**Pass 3 — Derivation (90–120 min):**
- Reproduce the main derivation or algorithm on paper.
- Compare with the guide's derivation.
- Answer the three questions.
- Write a 150-word summary and one limitation.

Papers are marked complete only after Pass 3.

---

## Appendix D — Interactive Exercise Specification

Each interactive component must satisfy:

1. **One concept per widget.** Do not combine two unrelated ideas.
2. **Immediate feedback.** The visual and numeric output update together.
3. **Predict before reveal.** Ask the learner to commit to an answer first.
4. **Reset and randomize.** Every widget can reset and generate a new example.
5. **Explain the failure.** Wrong answers show *why* the reasoning is wrong.
6. **Keyboard accessible.** All controls reachable without a mouse.
7. **No hidden magic.** Inputs, outputs, and formulas are always visible.
8. **Local state only.** Progress is stored in `localStorage`; no network calls.

Per-chapter widget inventory is listed in each chapter's "Interactive exercises"
section.

---

## Appendix E — Mastery Rubric

| Level | Description |
|---|---|
| 0 — Unseen | The topic has not been studied. |
| 1 — Recognizes | Can identify the concept and its notation. |
| 2 — Explains | Can explain the concept in plain language. |
| 3 — Computes | Can solve a small numerical example. |
| 4 — Derives | Can reproduce the central derivation from memory. |
| 5 — Transfers | Can apply the idea to a new problem or diagnose a failure. |

A chapter is complete at level 4 for every item in its checklist, with at least
one item at level 5.

---

## 7. What Comes After This Plan

> **Implementation status (2026-11-08):** all 21 chapters of the guide are
> implemented in `docs/index.html`, including theory, worked examples,
> interactive labs, quizzes, and mastery checklists.

Once this plan is approved:

1. Build the HTML/CSS/JS shell and navigation.
2. Implement the reusable exercise framework.
3. Write Chapters 1–4 and their widgets.
4. Review pacing and difficulty with the learner.
5. Continue chapter by chapter.
6. Only after the theory guide is complete, begin the implementation ladder
   described in Chapter 18.

The implementation of the LLM itself is intentionally **out of scope for this
phase**.
