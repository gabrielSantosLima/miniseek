/* Chapter 12 — Long Short-Term Memory. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(12);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part III — Sequence Models <span class="dot"></span> Chapter 12</div>
        <h1 class="chapter-title">Long Short-Term Memory (LSTM)</h1>
        <p class="chapter-goal">
          Understand the original LSTM as a carefully designed solution to the
          vanishing-gradient problem, including every gate and the cell state.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">14 hours</span>
          <span class="meta-pill">Hochreiter &amp; Schmidhuber 1997</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#motivation">Motivation</a>
          <a href="#gates">Gates and cell state</a>
          <a href="#gradients">Gradient flow</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="motivation">
        <h2 class="section-title"><span class="section-index">12.1</span> Why a gated memory?</h2>
        <div class="prose">
          <p>
            A plain RNN overwrites its hidden state at every step through a
            multiplicative transition. That is efficient, but it makes long-term
            memory fragile: the gradient must pass through many Jacobians, and the
            state has no explicit mechanism for deciding what to keep.
          </p>
          <p>
            Hochreiter and Schmidhuber (1997) introduced a separate
            <strong>cell state</strong> with additive updates and multiplicative
            gates. The additive path is often called the
            <strong>constant error carousel</strong>: when the gates are open, the
            gradient can flow across many steps without being repeatedly multiplied
            by a weight matrix.
          </p>
          <p>
            This does not make all long dependencies easy, but it removes the most
            direct cause of exponential decay in the recurrent path. The model learns
            when to write, when to erase, and when to expose its memory.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Two states, two jobs</p>
              <p>
                The cell state $c_t$ carries long-term memory. The hidden state
                $h_t$ is the gated, squashed view of that memory that the rest of the
                network sees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="gates">
        <h2 class="section-title"><span class="section-index">12.2</span> Gates and cell state</h2>
        <div class="prose">
          <p>
            A common LSTM formulation uses three sigmoid gates and one tanh
            candidate. With $[\\mathbf{h}_{t-1},\\mathbf{x}_t]$ denoting the
            concatenation of the previous hidden state and the current input:
          </p>
          <div class="formula">
            $$\\mathbf{f}_t=\\sigma(W_f[\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_f),$$
            $$\\mathbf{i}_t=\\sigma(W_i[\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_i),$$
            $$\\tilde{\\mathbf{c}}_t=\\tanh(W_c[\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_c),$$
            $$\\mathbf{o}_t=\\sigma(W_o[\\mathbf{h}_{t-1},\\mathbf{x}_t]+\\mathbf{b}_o),$$
            $$\\mathbf{c}_t=\\mathbf{f}_t\\odot\\mathbf{c}_{t-1}
              +\\mathbf{i}_t\\odot\\tilde{\\mathbf{c}}_t,$$
            $$\\mathbf{h}_t=\\mathbf{o}_t\\odot\\tanh(\\mathbf{c}_t).$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{f}_t$", "Forget gate: how much of the previous cell state to keep."],
            ["$\\mathbf{i}_t$", "Input gate: how much of the new candidate to write."],
            ["$\\tilde{\\mathbf{c}}_t$", "Candidate cell state, produced by a tanh layer."],
            ["$\\mathbf{o}_t$", "Output gate: how much of the cell state to expose as the hidden state."],
            ["$\\mathbf{c}_t$", "Cell state: the long-term memory."],
            ["$\\mathbf{h}_t$", "Hidden state: the gated, squashed output."],
            ["$\\odot$", "Element-wise multiplication, applied independently per unit."],
            ["$\\sigma$", "The logistic sigmoid, which outputs values in $(0,1)$."]
          ])}
          <p>
            The gates are not hard switches; they are smooth values between zero and
            one. A forget value near zero erases the old memory, while a value near
            one preserves it. The input gate controls how strongly the candidate is
            written, and the output gate controls how much of the memory is visible.
          </p>
          <p>
            The cell state has no activation between steps. Information can travel
            along the top path with only element-wise multiplication by the forget
            gate. This is the structural reason LSTMs can preserve information longer
            than a plain RNN.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="gradients">
        <h2 class="section-title"><span class="section-index">12.3</span> Gradient flow through the cell state</h2>
        <div class="prose">
          <p>
            The cell-state update is additive:
          </p>
          <div class="formula">
            $$\\mathbf{c}_t=\\mathbf{f}_t\\odot\\mathbf{c}_{t-1}+\\mathbf{i}_t\\odot\\tilde{\\mathbf{c}}_t.$$
          </div>
          <p>
            Differentiating with respect to $\\mathbf{c}_{t-1}$ gives a diagonal
            factor $\\mathbf{f}_t$ rather than a full matrix multiplication. When
            the forget gate is close to one, the gradient passes through almost
            unchanged. This is the additive shortcut that the constant error carousel
            describes.
          </p>
          <p>
            The path is not perfectly free: the gates themselves depend on the
            parameters, and the output still passes through tanh. But the dominant
            recurrent path is additive, which changes the conditioning of the
            problem.
          </p>
          <p>
            Peephole connections let the gates see the cell state directly. They are
            a variant, not part of the original minimal formulation, and modern
            implementations often omit them. Layer-normalized LSTMs add normalization
            to stabilize training at scale.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">LSTM is not unlimited memory</p>
              <p>
                A fixed-size cell state still has finite capacity, and very long
                dependencies can remain difficult. The LSTM improves the gradient
                path; it does not remove the bottleneck.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">12.4</span> Worked example: one LSTM update</h2>
        <div class="prose">
          <p>
            Use one scalar cell to see exactly how the gates combine. The values are
            synthetic and chosen for arithmetic clarity.
          </p>
        </div>

        <div class="worked-example">
          <h3>A single cell step</h3>
          <p class="example-intro">
            Let $f=0.5$, $i=0.8$, $o=0.6$, $c_{t-1}=1$, and
            $\\tilde c_t=2$.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Update the cell state</h4>
              <p>
                $$c_t=f\\,c_{t-1}+i\\,\\tilde c_t
                  =0.5\\cdot1+0.8\\cdot2=0.5+1.6=2.1.$$
                The forget gate keeps half of the old memory, and the input gate
                writes $80\\%$ of the candidate.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Squash the cell state</h4>
              <p>
                $$\\tanh(c_t)=\\tanh(2.1)\\approx0.9705.$$
                The tanh keeps the exposed value in $(-1,1)$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Apply the output gate</h4>
              <p>
                $$h_t=o\\,\\tanh(c_t)
                  =0.6\\cdot0.9705\\approx0.5823.$$
                The cell stores $2.1$, but the hidden state exposes only about
                $0.5823$ of the squashed memory.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the additive update gives $2.1$; the output is
            $0.6\\tanh(2.1)=0.5823$. If the forget gate were $0$, the old memory would
            be erased and $c_t=0.8\\cdot2=1.6$. If the output gate were $0$, the
            memory would still update but $h_t$ would be zero.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">12.5</span> Lab</h2>
        <div data-widget="lstm-gates"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">12.6</span> Check your understanding</h2>
        <div data-widget="lstm-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">12.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(12, [
          "Write all six LSTM forward equations from memory.",
          "Explain the role of each gate.",
          "Explain why the cell state is additive.",
          "Trace a gradient through the cell state for several steps.",
          "Explain the limitations of LSTM."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">12.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Hochreiter & Schmidhuber (1997)", source: "Long Short-Term Memory" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 10", source: "Sequence modeling and gated recurrent networks" },
          { title: "Olah, Understanding LSTM Networks", source: "Optional: a visual walkthrough of the gates" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(12)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.lstmGates(root.querySelector('[data-widget="lstm-gates"]'));

    MS.createQuiz(root.querySelector('[data-widget="lstm-quiz"]'), {
      id: "lstm",
      chapterId: 12,
      title: "LSTM checkpoint",
      subtitle: "Follow the cell state and the gates.",
      questions: [
        {
          prompt: "Which gate controls how much of the previous cell state is kept?",
          options: ["Input gate", "Forget gate", "Output gate", "Candidate gate"],
          answer: 1,
          explanation: "The forget gate multiplies the previous cell state before the new candidate is added."
        },
        {
          prompt: "Why is the cell-state path additive?",
          options: [
            "It uses a step function",
            "It avoids repeated multiplication by a recurrent weight matrix",
            "It removes the need for gates",
            "It makes the state discrete"
          ],
          answer: 1,
          explanation: "The additive update creates a shortcut for gradients; the gates still modulate it, but the dominant path is not a full matrix product."
        },
        {
          prompt: "The output gate controls:",
          options: [
            "How much of the cell state is exposed as $h_t$",
            "How much of the input is discarded",
            "The learning rate",
            "The vocabulary size"
          ],
          answer: 0,
          explanation: "The hidden state is $o_t\\odot\\tanh(c_t)$, so the output gate scales the exposed memory."
        },
        {
          prompt: "A forget gate value near zero means:",
          options: ["Keep almost all old memory", "Erase almost all old memory", "Double the memory", "Skip the output gate"],
          answer: 1,
          explanation: "Multiplying the previous cell state by a value near zero removes it."
        },
        {
          prompt: "LSTM solves:",
          options: [
            "All long-range dependency problems",
            "The vanishing-gradient path problem, but not every memory limitation",
            "Tokenization",
            "The need for training data"
          ],
          answer: 1,
          explanation: "The additive cell path improves gradient flow, but the fixed-size state still limits capacity."
        }
      ]
    });

    MS.ui.bindChecklist(root, 12);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[12] = true;
})();
