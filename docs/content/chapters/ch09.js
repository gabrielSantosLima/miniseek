/* Chapter 9 — Backpropagation from scratch. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(9);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part II — Neural Networks and Backpropagation <span class="dot"></span> Chapter 9</div>
        <h1 class="chapter-title">Backpropagation from Scratch</h1>
        <p class="chapter-goal">
          Derive backpropagation completely, from a scalar computational graph to
          vectorized matrix formulas, and understand why it is reverse-mode
          automatic differentiation.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">20 hours</span>
          <span class="meta-pill">DLB Ch. 6</span>
          <span class="meta-pill">2 interactive labs</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#graph">Computational graphs</a>
          <a href="#reverse">The reverse pass</a>
          <a href="#matrix">Matrix backprop</a>
          <a href="#labs">Labs</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="graph">
        <h2 class="section-title"><span class="section-index">9.1</span> Computational graphs</h2>
        <div class="prose">
          <p>
            A computation is a directed acyclic graph (DAG). Each node produces a
            value from its parents. For a two-layer MLP:
          </p>
          <div class="formula">
            $$\\mathbf{z}_1=W_1\\mathbf{x}+\\mathbf{b}_1,\\quad
              \\mathbf{a}_1=\\phi(\\mathbf{z}_1),\\quad
              \\mathbf{z}_2=W_2\\mathbf{a}_1+\\mathbf{b}_2,\\quad
              L=\\ell(\\mathbf{z}_2,\\mathbf{y})$$
          </div>
          <p>
            The forward pass computes every intermediate value and caches it. The
            backward pass needs those cached values to evaluate local derivatives.
          </p>
          <p>
            For a scalar node $u=f(v)$, the local derivative is $\\partial u/\\partial v$.
            The chain rule multiplies local derivatives along every path from the
            loss to a parameter.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="reverse">
        <h2 class="section-title"><span class="section-index">9.2</span> The reverse pass</h2>
        <div class="prose">
          <p>
            Reverse-mode autodiff starts with
            $\\partial L/\\partial L=1$ and walks the graph backwards. At each node,
            it computes a vector-Jacobian product (VJP):
          </p>
          <div class="formula">
            $$\\bar{v}=\\sum_{u\\in\\text{children}(v)}
              \\bar{u}\\,\\frac{\\partial u}{\\partial v}$$
          </div>
          <p>
            If a value is used by several nodes, its gradient contributions
            accumulate. This is why parameter sharing works naturally in the same
            framework.
          </p>
          <p>
            For a dense layer $\\mathbf{z}=W\\mathbf{a}+\\mathbf{b}$ with upstream
            gradient $\\delta=\\partial L/\\partial\\mathbf{z}$:
          </p>
          <div class="formula">
            $$\\frac{\\partial L}{\\partial W}=\\delta\\mathbf{a}^T,\\qquad
              \\frac{\\partial L}{\\partial\\mathbf{b}}=\\delta,\\qquad
              \\frac{\\partial L}{\\partial\\mathbf{a}}=W^T\\delta$$
          </div>
          <p>
            For a layer followed by an activation,
            $\\delta_{\\text{prev}}=(W^T\\delta)\\odot\\phi'(\\mathbf{z})$.
          </p>
          <p>
            The reverse pass costs roughly one forward pass plus one backward pass,
            independent of the number of parameters (for a scalar loss). That is the
            key efficiency of reverse mode.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="matrix">
        <h2 class="section-title"><span class="section-index">9.3</span> Softmax, cross-entropy, and gradient checking</h2>
        <div class="prose">
          <p>
            For logits $\\mathbf{z}$ and a correct class $c$, softmax plus
            cross-entropy has a remarkably simple gradient:
          </p>
          <div class="formula">
            $$\\hat{\\mathbf{y}}=\\operatorname{softmax}(\\mathbf{z}),\\qquad
              L=-\\log\\hat y_c,\\qquad
              \\frac{\\partial L}{\\partial\\mathbf{z}}=\\hat{\\mathbf{y}}-\\mathbf{y}$$
          </div>
          <p>
            This is the gradient that flows into the final linear layer of a language
            model. The target $\\mathbf{y}$ is one-hot for the correct next token.
          </p>
          <p>
            To debug a backward pass, compare it with a central finite difference:
          </p>
          <div class="formula">
            $$\\frac{\\partial L}{\\partial\\theta}
              \\approx\\frac{L(\\theta+h)-L(\\theta-h)}{2h}$$
          </div>
          <p>
            Use a moderate $h$ (for example $10^{-4}$ to $10^{-6}$). Too large and the
            approximation is biased; too small and floating-point cancellation
            dominates.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Backprop is not a separate algorithm</p>
              <p>
                It is the chain rule applied in reverse topological order, with
                cached forward values and accumulated gradients.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">9.4</span> Labs</h2>
        <div data-widget="backprop-graph"></div>
        <div data-widget="gradient-check"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">9.5</span> Check your understanding</h2>
        <div data-widget="backprop-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">9.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(9, [
          "Draw the computational graph for a two-layer MLP.",
          "Derive every local derivative in that graph.",
          "Write the vectorized backward pass for a dense layer.",
          "Derive the softmax + cross-entropy gradient.",
          "Explain why gradients accumulate when parameters are shared.",
          "Perform a gradient check and interpret a mismatch.",
          "Explain reverse-mode autodiff in one paragraph."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">9.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 6", source: "Backpropagation and computational graphs" },
          { title: "Nielsen, Neural Networks and Deep Learning — Chapter 2", source: "A step-by-step derivation of backpropagation" },
          { title: "Parr & Howard, The Matrix Calculus You Need For Deep Learning", source: "Matrix chain rule and VJPs" },
          { title: "Rumelhart, Hinton & Williams (1986)", source: "The original back-propagation paper" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(9)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.backpropGraph(root.querySelector('[data-widget="backprop-graph"]'));
    MS.widgets.gradientCheck(root.querySelector('[data-widget="gradient-check"]'));

    MS.createQuiz(root.querySelector('[data-widget="backprop-quiz"]'), {
      id: "backprop",
      chapterId: 9,
      title: "Backpropagation checkpoint",
      subtitle: "Follow the chain rule backwards.",
      questions: [
        {
          prompt: "Reverse-mode autodiff starts the backward pass at:",
          options: ["The first parameter", "The loss", "The input", "The last activation"],
          answer: 1,
          explanation: "It seeds the loss gradient at 1 and propagates contributions backwards."
        },
        {
          prompt: "For a dense layer, the gradient with respect to the input is:",
          options: ["$W\\delta$", "$W^T\\delta$", "$\\delta W$", "$\\delta^T W$"],
          answer: 1,
          explanation: "The VJP of $y=Wx+b$ with respect to $x$ is $W^T\\delta$."
        },
        {
          prompt: "For softmax + cross-entropy, $\\partial L/\\partial z$ equals:",
          options: ["$\\hat y$", "$\\hat y-y$", "$y-\\hat y$", "$\\hat y\\odot y$"],
          answer: 1,
          explanation: "The softmax and log cancel, leaving the clean gradient $\\hat y-y$."
        },
        {
          prompt: "Why does the backward pass cache forward values?",
          options: [
            "To avoid computing local derivatives",
            "To evaluate local derivatives without recomputing the forward pass",
            "To make the loss smaller",
            "To remove the need for a learning rate"
          ],
          answer: 1,
          explanation: "Local derivatives such as $\\phi'(z)$ need the intermediate values from the forward pass."
        },
        {
          prompt: "A gradient check uses:",
          options: [
            "A random guess",
            "A central finite difference",
            "The determinant of the Jacobian",
            "The softmax output"
          ],
          answer: 1,
          explanation: "Comparing the analytic gradient with $(L(\\theta+h)-L(\\theta-h))/(2h)$ catches implementation errors."
        }
      ]
    });

    MS.ui.bindChecklist(root, 9);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[9] = true;
})();
