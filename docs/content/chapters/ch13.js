/* Chapter 13 — Gated Recurrent Unit. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(13);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part III — Sequence Models <span class="dot"></span> Chapter 13</div>
        <h1 class="chapter-title">Gated Recurrent Unit (GRU)</h1>
        <p class="chapter-goal">
          Understand the GRU as a simpler gated alternative to the LSTM and compare
          their design trade-offs from the literature.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">10 hours</span>
          <span class="meta-pill">Cho et al. 2014</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#idea">The GRU idea</a>
          <a href="#equations">Equations</a>
          <a href="#compare">GRU vs LSTM</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="idea">
        <h2 class="section-title"><span class="section-index">13.1</span> A simpler gated memory</h2>
        <div class="prose">
          <p>
            The Gated Recurrent Unit (GRU), introduced by Cho et al. (2014) in the
            context of neural machine translation, keeps the central idea of gating
            but removes the separate cell state. It uses two gates and a single hidden
            state:
          </p>
          <ul>
            <li><strong>update gate</strong> — how much of the old state to keep versus how much of the candidate to accept;</li>
            <li><strong>reset gate</strong> — how much of the previous state to use when forming the candidate.</li>
          </ul>
          <p>
            The resulting model has fewer parameters than an LSTM and is often easier
            to train on smaller datasets. The trade-off is less explicit control over
            long-term memory: there is no dedicated cell state, only the hidden state.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="equations">
        <h2 class="section-title"><span class="section-index">13.2</span> Equations</h2>
        <div class="prose">
          <p>
            One common formulation is:
          </p>
          <div class="formula">
            $$\\mathbf{z}_t=\\sigma(W_z[\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_z),$$
            $$\\mathbf{r}_t=\\sigma(W_r[\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_r),$$
            $$\\tilde{\\mathbf{h}}_t=\\tanh(W_h[\\mathbf{r}_t\\odot\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_h),$$
            $$\\mathbf{h}_t=(1-\\mathbf{z}_t)\\odot\\mathbf{h}_{t-1}
              +\\mathbf{z}_t\\odot\\tilde{\\mathbf{h}}_t.$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{z}_t$", "Update gate: the interpolation weight between old state and candidate."],
            ["$\\mathbf{r}_t$", "Reset gate: how much of the previous state enters the candidate."],
            ["$\\tilde{\\mathbf{h}}_t$", "Candidate hidden state."],
            ["$\\mathbf{h}_{t-1}$", "Previous hidden state; there is no separate cell state."],
            ["$[\\cdot,\\cdot]$", "Concatenation of the reset previous state and the current input."],
            ["$\\odot$", "Element-wise multiplication."],
            ["$\\sigma$", "Logistic sigmoid, producing values in $(0,1)$."]
          ])}
          <p>
            The update gate is a convex interpolation: when $z_t$ is close to one, the
            new candidate dominates; when it is close to zero, the old state is
            preserved. The reset gate can suppress part of the past before the
            candidate is computed, which lets the unit forget irrelevant history
            without necessarily erasing the state used at the output.
          </p>
          <p>
            Unlike the LSTM, the GRU exposes its memory directly. There is no
            $\\tanh(c_t)$ output stage and no output gate. This reduces the parameter
            count to roughly three weight blocks ($z$, $r$, and candidate) instead of
            four in the LSTM.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="compare">
        <h2 class="section-title"><span class="section-index">13.3</span> GRU versus LSTM</h2>
        <div class="prose">
          <p>
            Both architectures use sigmoid gates and an additive update. The main
            differences are:
          </p>
          <table>
            <thead><tr><th>Property</th><th>LSTM</th><th>GRU</th></tr></thead>
            <tbody>
              <tr><td>States</td><td>Cell state $c_t$ and hidden state $h_t$</td><td>Hidden state $h_t$ only</td></tr>
              <tr><td>Gates</td><td>Forget, input, output</td><td>Update, reset</td></tr>
              <tr><td>Parameter blocks</td><td>Four</td><td>Three</td></tr>
              <tr><td>Memory path</td><td>Additive cell state</td><td>Convex interpolation of hidden state</td></tr>
              <tr><td>Typical advantage</td><td>More explicit long-term memory</td><td>Simpler, faster, fewer parameters</td></tr>
            </tbody>
          </table>
          <p>
            Empirical comparisons, such as Chung et al. (2014), found that GRUs and
            LSTMs perform similarly on many sequence-modeling tasks, with differences
            depending on dataset size and hyperparameters. The choice is not universal:
            it should be tested on the task at hand.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Both share a limitation</p>
              <p>
                Recurrent models process tokens sequentially and compress the past into
                a fixed-size state. Transformers remove the sequential bottleneck with
                attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">13.4</span> Worked example: one GRU update</h2>
        <div class="prose">
          <p>
            Use one scalar unit. The candidate pre-activation $0.4$ is the value after
            applying the reset gate and the weights; this keeps the arithmetic focused
            on the interpolation.
          </p>
        </div>

        <div class="worked-example">
          <h3>A single GRU step</h3>
          <p class="example-intro">
            Let $z=0.3$, $r=0.6$, $h_{t-1}=1$, and candidate pre-activation $=0.4$.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Candidate state</h4>
              <p>
                $$\\tilde h_t=\\tanh(0.4)\\approx0.37995.$$
                The reset gate has already shaped the pre-activation, so this is the
                candidate after the gated view of the past.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Interpolate with the update gate</h4>
              <p>
                $$h_t=(1-z)h_{t-1}+z\\tilde h_t
                  =0.7\\cdot1+0.3\\cdot0.37995.$$
                $$h_t=0.7+0.113985=0.813985.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Interpret the weights</h4>
              <p>
                The old state contributes $0.7$ and the candidate contributes
                $0.113985$. Because $z=0.3$ is small, the unit is conservative: it
                keeps most of the previous state.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the interpolation weights sum to one:
            $(1-z)+z=0.7+0.3=1$. The candidate is $\\tanh(0.4)=0.37995$, and the
            weighted sum is $0.7+0.113985=0.813985$. If $z$ were $1$, the old state
            would be discarded and $h_t$ would equal the candidate.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">13.5</span> Lab</h2>
        <div data-widget="gru-gates"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">13.6</span> Check your understanding</h2>
        <div data-widget="gru-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">13.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(13, [
          "Write the GRU forward equations from memory.",
          "Explain the difference between the update and reset gates.",
          "Compare GRU and LSTM parameter counts.",
          "Explain when a GRU may be preferable.",
          "State the shared limitations of recurrent models."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">13.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Cho et al. (2014)", source: "Learning Phrase Representations using RNN Encoder–Decoder for Statistical Machine Translation" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 10", source: "Sequence modeling and gated recurrent networks" },
          { title: "Chung et al. (2014)", source: "Optional: empirical evaluation of gated recurrent units" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(13)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.gruGates(root.querySelector('[data-widget="gru-gates"]'));

    MS.createQuiz(root.querySelector('[data-widget="gru-quiz"]'), {
      id: "gru",
      chapterId: 13,
      title: "GRU checkpoint",
      subtitle: "Interpolation and gating.",
      questions: [
        {
          prompt: "The update gate $z_t$ controls:",
          options: [
            "How much of the previous state is kept versus the candidate",
            "How much of the input is tokenized",
            "The number of layers",
            "The learning rate"
          ],
          answer: 0,
          explanation: "The state is $(1-z_t)h_{t-1}+z_t\\tilde h_t$, a convex interpolation."
        },
        {
          prompt: "The reset gate $r_t$ controls:",
          options: [
            "How much of the previous state enters the candidate",
            "How much of the output is exposed",
            "The vocabulary size",
            "The loss function"
          ],
          answer: 0,
          explanation: "The candidate uses $r_t\\odot h_{t-1}$, so the reset gate can suppress part of the past."
        },
        {
          prompt: "Compared with an LSTM, a GRU has:",
          options: ["More gates", "Fewer parameter blocks", "A separate cell state", "No recurrence"],
          answer: 1,
          explanation: "The GRU uses update and reset gates and has no separate cell state, so it has fewer parameters."
        },
        {
          prompt: "GRU and LSTM share which limitation?",
          options: [
            "They cannot process sequences",
            "They compress the past into a fixed-size state",
            "They require a Transformer",
            "They cannot be trained with gradients"
          ],
          answer: 1,
          explanation: "Both are recurrent, so the past must fit into a fixed-size hidden state."
        }
      ]
    });

    MS.ui.bindChecklist(root, 13);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[13] = true;
})();
