/* Chapter 11 — Recurrent neural networks and BPTT. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(11);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part III — Sequence Models <span class="dot"></span> Chapter 11</div>
        <h1 class="chapter-title">Recurrent Neural Networks and Backpropagation Through Time</h1>
        <p class="chapter-goal">
          Understand recurrence as parameter sharing across time and derive why
          gradients through long sequences are fragile.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">16 hours</span>
          <span class="meta-pill">Bengio 1994 · Pascanu 2013</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#recurrence">Recurrence</a>
          <a href="#bptt">BPTT</a>
          <a href="#vanishing">Vanishing gradients</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="recurrence">
        <h2 class="section-title"><span class="section-index">11.1</span> Recurrence and parameter sharing</h2>
        <div class="prose">
          <p>
            A recurrent neural network processes a sequence one step at a time and
            carries a hidden state from one step to the next. The simplest form is:
          </p>
          <div class="formula">
            $$\\mathbf{h}_t=\\tanh(W_h\\mathbf{h}_{t-1}+W_x\\mathbf{x}_t+\\mathbf{b}_h),\\qquad
              \\hat{\\mathbf{y}}_t=W_y\\mathbf{h}_t+\\mathbf{b}_y$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{x}_t$", "The input at time step $t$."],
            ["$\\mathbf{h}_{t-1}$", "The hidden state carried from the previous step."],
            ["$\\mathbf{h}_t$", "The new hidden state, which summarizes the prefix up to $t$."],
            ["$W_h$", "The recurrent weight matrix applied to the previous hidden state."],
            ["$W_x$", "The input weight matrix applied to the current input."],
            ["$\\mathbf{b}_h$", "The hidden bias."],
            ["$\\hat{\\mathbf{y}}_t$", "The output at step $t$, produced by the output layer."]
          ])}
          <p>
            The same $W_h$, $W_x$, and $\\mathbf{b}_h$ are reused at every step. This
            is <strong>parameter sharing across time</strong>: the model learns one
            transition function and applies it repeatedly. It also means the network
            can process sequences of different lengths without changing its parameter
            count.
          </p>
          <p>
            Unrolling the recurrence for $T$ steps produces a deep computational
            graph with $T$ copies of the same weights. The graph is deep in time, not
            in layers. Backpropagation through time (BPTT) is ordinary
            backpropagation on that unrolled graph.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">State is a bottleneck</p>
              <p>
                The hidden state has a fixed size. Everything the model remembers
                about the past must fit into that vector, which is a fundamental
                limitation of plain RNNs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="bptt">
        <h2 class="section-title"><span class="section-index">11.2</span> Backpropagation through time</h2>
        <div class="prose">
          <p>
            Let $L=\\sum_t L_t$ be the total loss over the sequence. The gradient at
            an earlier hidden state receives contributions from every later step.
            The recursion is:
          </p>
          <div class="formula">
            $$\\frac{\\partial L}{\\partial\\mathbf{h}_t}
              =\\frac{\\partial L_t}{\\partial\\mathbf{h}_t}
              +\\left(\\frac{\\partial\\mathbf{h}_{t+1}}{\\partial\\mathbf{h}_t}\\right)^T
                \\frac{\\partial L}{\\partial\\mathbf{h}_{t+1}}$$
          </div>
          ${MS.ui.symbols([
            ["$\\partial L/\\partial\\mathbf{h}_t$", "The total gradient arriving at hidden state $t$."],
            ["$\\partial L_t/\\partial\\mathbf{h}_t$", "The direct loss contribution from the output at step $t$."],
            ["$\\partial\\mathbf{h}_{t+1}/\\partial\\mathbf{h}_t$", "The Jacobian of the recurrent transition."],
            ["$(\\cdot)^T$", "The transpose that maps the upstream gradient back to the hidden-state space."]
          ])}
          <p>
            Unrolling the recursion shows that the gradient from step $T$ to step $1$
            is a product of Jacobians:
          </p>
          <div class="formula">
            $$\\frac{\\partial\\mathbf{h}_T}{\\partial\\mathbf{h}_1}
              =\\prod_{t=2}^{T}\\frac{\\partial\\mathbf{h}_t}{\\partial\\mathbf{h}_{t-1}}$$
          </div>
          <p>
            For the linear recurrence $\\mathbf{h}_t=W_h\\mathbf{h}_{t-1}$, every
            factor is $W_h$, so the product is $W_h^{T-1}$. In a tanh RNN, each
            factor is $W_h$ multiplied by the diagonal Jacobian of tanh. The
            qualitative behaviour is the same: repeated multiplication either shrinks
            or grows the signal.
          </p>
          <p>
            BPTT has a large memory cost because every intermediate activation must be
            kept for the backward pass. <strong>Truncated BPTT</strong> limits the
            backward window to a fixed number of steps, trading long-range credit
            assignment for memory and compute.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="vanishing">
        <h2 class="section-title"><span class="section-index">11.3</span> Vanishing and exploding gradients</h2>
        <div class="prose">
          <p>
            If the norm of the recurrent Jacobian is consistently less than one, the
            product shrinks exponentially. This is the <strong>vanishing gradient</strong>
            problem: the model cannot learn dependencies that span many steps because
            the gradient reaching the early steps is numerically tiny.
          </p>
          <p>
            If the norm is consistently greater than one, the product grows
            exponentially. This is the <strong>exploding gradient</strong> problem:
            updates become enormous and training diverges.
          </p>
          <p>
            Bengio, Simard and Frasconi (1994) showed that gradient descent has
            difficulty latching onto long-term dependencies. Pascanu, Mikolov and
            Bengio (2013) analyzed the problem through the recurrent Jacobian and
            popularized <strong>gradient clipping</strong> for the exploding case.
          </p>
          <p>
            Gradient clipping rescales the gradient when its norm exceeds a threshold:
          </p>
          <div class="formula">
            $$\\mathbf{g}\\leftarrow
              \\begin{cases}
                \\mathbf{g}, & \\lVert\\mathbf{g}\\rVert\\le\\tau\\\\
                \\tau\\dfrac{\\mathbf{g}}{\\lVert\\mathbf{g}\\rVert}, & \\lVert\\mathbf{g}\\rVert>\\tau
              \\end{cases}$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{g}$", "The gradient vector for all parameters."],
            ["$\\lVert\\mathbf{g}\\rVert$", "Its Euclidean norm."],
            ["$\\tau$", "The clipping threshold."],
            ["$\\tau\\mathbf{g}/\\lVert\\mathbf{g}\\rVert$", "The rescaled gradient, which keeps its direction but has norm $\\tau$."]
          ])}
          <p>
            Clipping controls exploding gradients but does not restore information
            lost to vanishing gradients. Architectural changes such as LSTM and GRU
            address the latter by creating additive paths for the state.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">Clipping is not a cure-all</p>
              <p>
                A clipped gradient can still point in a poor direction. Clipping
                prevents numerical blow-up; it does not make long-range dependencies
                easy to learn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">11.4</span> Worked example: gradient flow in a linear RNN</h2>
        <div class="prose">
          <p>
            Use the scalar recurrence $h_t=wh_{t-1}+x_t$ with $h_0=0$, $x_1=1$,
            and $x_2=x_3=0$. This removes the tanh nonlinearity so the gradient
            product can be computed exactly.
          </p>
        </div>

        <div class="worked-example">
          <h3>Two weights, two fates</h3>
          <p class="example-intro">
            Compute the hidden states and $\\partial h_3/\\partial h_1$ for $w=0.5$
            and $w=1.5$.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Case $w=0.5$</h4>
              <p>
                $$h_1=0.5\\cdot0+1=1,$$
                $$h_2=0.5\\cdot1+0=0.5,$$
                $$h_3=0.5\\cdot0.5+0=0.25.$$
                The gradient is
                $$\\frac{\\partial h_3}{\\partial h_1}=w^2=0.5^2=0.25.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Case $w=1.5$</h4>
              <p>
                $$h_1=1,\\qquad h_2=1.5,\\qquad h_3=1.5\\cdot1.5=2.25.$$
                The gradient is
                $$\\frac{\\partial h_3}{\\partial h_1}=w^2=1.5^2=2.25.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Long sequences amplify the effect</h4>
              <p>
                For $T=20$, the gradient is $w^{19}$. With $w=0.5$,
                $0.5^{19}\\approx1.91\\times10^{-6}$, which is essentially zero in
                floating point. With $w=1.5$, $1.5^{19}\\approx2216.84$, which is
                large enough to destabilize training.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> each backward step multiplies by the same
            factor $w$. For $|w|&lt;1$ the product shrinks; for $|w|&gt;1$ it grows.
            The tanh nonlinearity adds a derivative factor at most $1$, so it cannot
            turn an exploding linear product into a stable one by itself.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">11.5</span> Lab</h2>
        <div data-widget="rnn-flow"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">11.6</span> Check your understanding</h2>
        <div data-widget="rnn-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">11.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(11, [
          "Write the RNN forward equations from memory.",
          "Unroll an RNN for three time steps and draw the graph.",
          "Derive the BPTT recursion.",
          "Explain vanishing and exploding gradients with the product of Jacobians.",
          "Explain what gradient clipping does and does not fix.",
          "Explain the trade-offs of truncated BPTT."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">11.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Bengio, Simard & Frasconi (1994)", source: "Learning long-term dependencies with gradient descent is difficult" },
          { title: "Pascanu, Mikolov & Bengio (2013)", source: "On the difficulty of training recurrent neural networks" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 10", source: "Sequence modeling and recurrent networks" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(11)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.rnnFlow(root.querySelector('[data-widget="rnn-flow"]'));

    MS.createQuiz(root.querySelector('[data-widget="rnn-quiz"]'), {
      id: "rnn",
      chapterId: 11,
      title: "RNN and BPTT checkpoint",
      subtitle: "Think in terms of repeated Jacobians.",
      questions: [
        {
          prompt: "What is shared across time steps in a vanilla RNN?",
          options: ["Only the input", "The weight matrices and biases", "The output labels", "Nothing"],
          answer: 1,
          explanation: "The same transition function is applied at every step, which is why the parameter count does not grow with sequence length."
        },
        {
          prompt: "The gradient $\\partial h_T/\\partial h_1$ is a product of:",
          options: ["Losses", "Recurrent Jacobians", "Inputs", "Softmax weights"],
          answer: 1,
          explanation: "Each step contributes the Jacobian of the transition, and reverse-mode autodiff multiplies them."
        },
        {
          prompt: "Vanishing gradients occur when the recurrent Jacobian norms are consistently:",
          options: ["Greater than one", "Less than one", "Exactly zero", "Complex"],
          answer: 1,
          explanation: "A product of factors with norm below one shrinks exponentially with sequence length."
        },
        {
          prompt: "Gradient clipping primarily addresses:",
          options: ["Vanishing gradients", "Exploding gradients", "Overfitting", "Tokenization"],
          answer: 1,
          explanation: "Clipping rescales large gradients so updates stay bounded; it does not recover a vanished signal."
        },
        {
          prompt: "Truncated BPTT trades:",
          options: ["Accuracy for memory and compute", "Weights for biases", "Layers for tokens", "Softmax for sigmoid"],
          answer: 0,
          explanation: "It limits the backward window, reducing memory and compute at the cost of long-range credit assignment."
        }
      ]
    });

    MS.ui.bindChecklist(root, 11);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[11] = true;
})();
