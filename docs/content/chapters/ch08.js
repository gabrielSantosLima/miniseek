/* Chapter 8 — From linear models to neural networks. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(8);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part II — Neural Networks and Backpropagation <span class="dot"></span> Chapter 8</div>
        <h1 class="chapter-title">From Linear Models to Neural Networks</h1>
        <p class="chapter-goal">
          Build the simplest models that learn, then see exactly what a
          nonlinearity adds.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">12 hours</span>
          <span class="meta-pill">DLB Ch. 4–5</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#linear">Linear and logistic models</a>
          <a href="#mlp">Multilayer perceptrons</a>
          <a href="#universal">Universal approximation</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="linear">
        <h2 class="section-title"><span class="section-index">8.1</span> Linear and logistic models</h2>
        <div class="prose">
          <p>
            Linear regression predicts a scalar as an affine function of the input:
          </p>
          <div class="formula">
            $$\\hat{y}=w^Tx+b$$
            <div class="formula-caption">The mean-squared error is $\\frac1N\\sum_i(\\hat y_i-y_i)^2$.</div>
          </div>
          <p>
            Logistic regression passes the same score through a sigmoid to produce a
            probability:
          </p>
          <div class="formula">
            $$\\hat{p}=\\sigma(w^Tx+b),\\qquad
              \\sigma(z)=\\frac{1}{1+e^{-z}}$$
          </div>
          <p>
            Training minimizes binary cross-entropy,
            $-\\sum_i y_i\\log\\hat p_i+(1-y_i)\\log(1-\\hat p_i)$.
            The model is still linear in its parameters, so its decision boundary is
            a hyperplane.
          </p>
          <p>
            The perceptron is the historical precursor: a linear threshold unit. It
            can separate linearly separable data, but it cannot represent XOR or any
            other non-linear boundary.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">The XOR limitation</p>
              <p>
                No single straight line separates the four XOR points. The fix is
                not a better optimizer; it is a representation with a hidden layer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="mlp">
        <h2 class="section-title"><span class="section-index">8.2</span> Multilayer perceptrons</h2>
        <div class="prose">
          <p>
            A multilayer perceptron (MLP) stacks affine maps and nonlinear
            activations:
          </p>
          <div class="formula">
            $$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1),\\qquad
              \\hat{\\mathbf{y}}=W_2\\mathbf{h}+\\mathbf{b}_2$$
          </div>
          <p>
            The activation $\\phi$ is applied element-wise. Common choices:
          </p>
          <ul>
            <li><strong>Sigmoid:</strong> bounded, smooth, but saturating.</li>
            <li><strong>Tanh:</strong> zero-centred and smooth, still saturating.</li>
            <li><strong>ReLU:</strong> cheap, non-saturating for positive inputs, but has a dead zone.</li>
            <li><strong>GELU / Swish:</strong> smooth, non-monotonic, common in Transformers.</li>
          </ul>
          <p>
            Without nonlinearities, a composition of affine maps is still affine:
            $W_2(W_1x+b_1)+b_2=(W_2W_1)x+(W_2b_1+b_2)$. Depth without
            nonlinearity adds no representational power.
          </p>
          <p>
            With nonlinearities, hidden units act as learned features. The output
            layer combines those features linearly, which is why the final layer of
            a language model is often just a linear projection to vocabulary logits.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="universal">
        <h2 class="section-title"><span class="section-index">8.3</span> Universal approximation</h2>
        <div class="prose">
          <p>
            The universal approximation theorem states that a feed-forward network
            with at least one hidden layer and a suitable nonlinearity can approximate
            any continuous function on a compact domain to arbitrary accuracy,
            provided enough hidden units.
          </p>
          <p>
            What it does <em>not</em> guarantee:
          </p>
          <ul>
            <li>that gradient descent will find the required weights,</li>
            <li>that the network will generalize from finite data,</li>
            <li>that the required number of units is practical,</li>
            <li>that the approximation is stable or interpretable.</li>
          </ul>
          <p>
            This is the central distinction between <strong>representational
            capacity</strong> and <strong>learnability</strong>. The theorem is about
            the former; training is about the latter.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">8.4</span> Lab</h2>
        <div data-widget="mlp-fit"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">8.5</span> Check your understanding</h2>
        <div data-widget="nn-foundations-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">8.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(8, [
          "Derive the gradient of MSE for linear regression.",
          "Derive logistic regression's cross-entropy gradient.",
          "Explain why a linear model cannot solve XOR.",
          "State the universal approximation theorem and its limitations.",
          "Choose an activation function and justify the choice."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">8.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapters 4–5", source: "Linear models, MLPs, activations, and capacity" },
          { title: "Nielsen, Neural Networks and Deep Learning — Chapters 1–2", source: "A gentle derivation of perceptrons and sigmoid networks" },
          { title: "Deisenroth, Faisal & Ong, Mathematics for Machine Learning — Chapter 5", source: "Linear regression and classification" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(8)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.mlpFit(root.querySelector('[data-widget="mlp-fit"]'));

    MS.createQuiz(root.querySelector('[data-widget="nn-foundations-quiz"]'), {
      id: "nn-foundations",
      chapterId: 8,
      title: "Neural network foundations",
      subtitle: "Representation, nonlinearity, and loss.",
      questions: [
        {
          prompt: "Why does a deep network need nonlinear activation functions?",
          options: [
            "Without them, the composition collapses to a single affine map",
            "They make the network slower",
            "They remove the need for gradients",
            "They guarantee generalization"
          ],
          answer: 0,
          explanation: "A composition of affine maps is affine, so depth without nonlinearity has the same representational power as one layer."
        },
        {
          prompt: "Why can a single linear classifier not solve XOR?",
          options: [
            "The data is too large",
            "No straight line separates the classes",
            "The sigmoid is undefined",
            "The learning rate is too small"
          ],
          answer: 1,
          explanation: "XOR is not linearly separable; a hidden layer is needed to create a nonlinear decision boundary."
        },
        {
          prompt: "The universal approximation theorem guarantees:",
          options: [
            "That training will converge",
            "That a wide enough network can represent a continuous function",
            "That the model will generalize",
            "That no data is needed"
          ],
          answer: 1,
          explanation: "It is a statement about representational capacity, not about optimization or generalization."
        },
        {
          prompt: "For $\\hat y=wx+b$ and MSE, $\\partial L/\\partial w$ is proportional to:",
          options: ["$x$", "$(\\hat y-y)x$", "$\\hat y+y$", "$w^2$"],
          answer: 1,
          explanation: "The gradient of squared error with respect to $w$ is $2(\\hat y-y)x$ before averaging."
        },
        {
          prompt: "The output of logistic regression is:",
          options: [
            "An unbounded score",
            "A probability in $(0,1)$",
            "A token ID",
            "A matrix"
          ],
          answer: 1,
          explanation: "The sigmoid maps the linear score to the interval $(0,1)$, which can be interpreted as a probability."
        }
      ]
    });

    MS.ui.bindChecklist(root, 8);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[8] = true;
})();
