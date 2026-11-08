/* Chapter 21 — The minimal viable LLM. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(21);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part VI — Minimal LLM Bridge <span class="dot"></span> Chapter 21</div>
        <h1 class="chapter-title">The Minimal Viable LLM</h1>
        <p class="chapter-goal">
          Define the smallest complete training and generation loop that can produce
          a working language model, without adding optional engineering.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">4 hours</span>
          <span class="meta-pill">Study blueprint</span>
          <span class="meta-pill">No implementation</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#scope">Scope</a>
          <a href="#architecture">Minimal architecture</a>
          <a href="#training">Training recipe</a>
          <a href="#worked">Worked example</a>
          <a href="#debug">Debug triage</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="scope">
        <h2 class="section-title"><span class="section-index">21.1</span> What “minimal” means</h2>
        <div class="prose">
          <p>
            A minimal viable LLM is not a production model. It is the smallest
            complete system that demonstrates the full causal language-modeling
            loop: data → forward pass → loss → backward pass → update → generation.
          </p>
          <p>
            The success criterion is concrete:
          </p>
          <ul>
            <li>the training loss decreases;</li>
            <li>the validation loss is finite and tracked;</li>
            <li>the model can overfit a tiny batch;</li>
            <li>sampling produces text that reflects the training corpus;</li>
            <li>the same run can be repeated with a fixed seed.</li>
          </ul>
          <p>
            Anything that does not help one of those criteria is an optional
            optimization. This is the boundary between a minimal model and a
            production system.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Overfit first</p>
              <p>
                Before training on a large corpus, verify that the model can drive the
                loss to near zero on a single small batch. If it cannot, the bug is in
                the model or training loop, not in the dataset size.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="architecture">
        <h2 class="section-title"><span class="section-index">21.2</span> Minimal architecture</h2>
        <div class="prose">
          <p>
            A decoder-only Transformer is enough. The minimal configuration below is
            a study target, not a fixed requirement:
          </p>
          <table>
            <thead><tr><th>Component</th><th>Minimal choice</th><th>Why</th></tr></thead>
            <tbody>
              <tr><td>Tokenizer</td><td>Character-level</td><td>No tokenizer training; vocabulary is tiny and deterministic.</td></tr>
              <tr><td>Layers</td><td>2–4</td><td>Enough depth to learn structure; still debuggable.</td></tr>
              <tr><td>$d_{model}$</td><td>64–128</td><td>Small enough for a single device, large enough to represent patterns.</td></tr>
              <tr><td>Heads</td><td>2–4</td><td>Multiple attention patterns without excessive complexity.</td></tr>
              <tr><td>Context $T$</td><td>64–128</td><td>Short windows keep attention cost manageable.</td></tr>
              <tr><td>FFN width</td><td>$4d_{model}$</td><td>Standard ratio; enough nonlinear capacity.</td></tr>
              <tr><td>Normalization</td><td>LayerNorm, pre-norm</td><td>Stable at small depth and easy to reason about.</td></tr>
              <tr><td>Positional signal</td><td>Learned or sinusoidal</td><td>Either is sufficient for a first model.</td></tr>
              <tr><td>Output head</td><td>Linear to vocabulary</td><td>Produces next-token logits; weight tying is optional.</td></tr>
            </tbody>
          </table>
          <p>
            This configuration omits RoPE, RMSNorm, SwiGLU, MQA/GQA, FlashAttention,
            and KV caching. Those are improvements, not prerequisites for a first
            working model.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="training">
        <h2 class="section-title"><span class="section-index">21.3</span> Minimal training recipe</h2>
        <div class="prose">
          <p>
            The smallest useful loop has six steps:
          </p>
          <ol>
            <li><strong>Build windows</strong> — tokenize, split into $T+1$ blocks, shift input and target.</li>
            <li><strong>Forward</strong> — embeddings, positional signal, Transformer blocks, logits.</li>
            <li><strong>Loss</strong> — stable cross-entropy against the shifted targets, ignoring padding.</li>
            <li><strong>Backward</strong> — compute gradients with autograd or a hand-written backward pass.</li>
            <li><strong>Clip and update</strong> — clip the global gradient norm, then apply Adam or AdamW.</li>
            <li><strong>Evaluate</strong> — periodically compute validation loss and a few samples.</li>
          </ol>
          <p>
            A practical starting point is Adam with learning rate around
            $3\\times10^{-4}$, batch size 16–32, gradient clipping at $1.0$, and a
            short warmup. These are starting points, not laws; the important thing is
            to log the loss and change one variable at a time.
          </p>
          <div class="formula">
            $$\\theta_{k+1}=\\theta_k-\\eta\\,\\frac{\\hat m_k}{\\sqrt{\\hat v_k}+\\epsilon},
              \\qquad \\lVert\\mathbf{g}\\rVert\\le\\tau.$$
          </div>
          ${MS.ui.symbols([
            ["$\\eta$", "Learning rate."],
            ["$\\hat m_k$", "Bias-corrected first moment of the gradient."],
            ["$\\hat v_k$", "Bias-corrected second moment."],
            ["$\\tau$", "Gradient-clipping threshold."]
          ])}
          <p>
            Do not add mixed precision, gradient accumulation, distributed training, or
            KV caching until the minimal loop is correct and reproducible.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">21.4</span> Worked example: size the minimal model</h2>
        <div class="prose">
          <p>
            Take a character-level model with vocabulary $V=100$, $d=64$, $L=2$
            layers, $h=4$ heads, $T=64$, and an FFN width $f=4d=256$. This is a
            realistic small configuration for a first run.
          </p>
        </div>

        <div class="worked-example">
          <h3>Minimal config, concrete numbers</h3>
          <p class="example-intro">
            Use the same parameter formula as Chapters 16 and 18. The goal is to see
            that a complete model can fit in a small budget.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Per-block parameters</h4>
              <p>
                $$4d^2=4\\cdot64^2=16{,}384,$$
                $$2df=2\\cdot64\\cdot256=32{,}768,$$
                $$f+9d=256+576=832.$$
                Per block: $16{,}384+32{,}768+832=49{,}984$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Total parameters</h4>
              <p>
                Two blocks: $2\\cdot49{,}984=99{,}968$.
                Embeddings: $Vd=100\\cdot64=6{,}400$.
                Final norm: $2d=128$.
                Total: $99{,}968+6{,}400+128=106{,}496$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Attention and batch shapes</h4>
              <p>
                Per layer: $hT^2=4\\cdot64^2=16{,}384$ attention entries.
                Across two layers: $32{,}768$.
                With batch $B=16$, input shape is $(16,64)$ and logits shape is
                $(16,64,100)$, or $102{,}400$ values.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>One-step sanity check</h4>
              <p>
                The total is about $0.106$M parameters. A model this size can overfit
                a tiny batch on a CPU, which makes it a good first milestone. Scaling
                to millions of parameters should wait until this loop is stable.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the per-block formula gives
            $4(64^2)+2(64)(256)+256+9(64)=49{,}984$. Two blocks plus the embedding
            table and final norm give $106{,}496$. The attention count and logits
            shapes use $T=64$ and $V=100$ consistently.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="debug">
        <h2 class="section-title"><span class="section-index">21.5</span> Debug triage and milestones</h2>
        <div class="prose">
          <p>
            Most failures in a first LLM implementation fall into a small number of
            categories:
          </p>
          <table>
            <thead><tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr></thead>
            <tbody>
              <tr><td>Loss stays at $\log V$</td><td>Targets not shifted or logits disconnected</td><td>Inspect one batch's input/target and the backward graph.</td></tr>
              <tr><td>Loss becomes NaN</td><td>Unstable softmax/CE, too-large learning rate, exploding gradient</td><td>Use log-sum-exp, lower the rate, clip the gradient.</td></tr>
              <tr><td>Training loss falls, validation rises</td><td>Overfitting or leakage</td><td>Check the split and add regularization or more data.</td></tr>
              <tr><td>Loss falls but samples are garbage</td><td>Decoding bug or tokenizer mismatch</td><td>Compare greedy decoding with the training distribution.</td></tr>
              <tr><td>Cannot overfit one batch</td><td>Implementation bug, not a data problem</td><td>Shrink the model and batch, check shapes and gradients.</td></tr>
            </tbody>
          </table>
          <p>
            The milestone ladder is:
          </p>
          <ol>
            <li>overfit one batch;</li>
            <li>train on a tiny corpus;</li>
            <li>generate coherent samples;</li>
            <li>add validation and sampling controls;</li>
            <li>scale the model only after the loop is stable.</li>
          </ol>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">The study guide ends here</p>
              <p>
                This chapter is a blueprint, not code. The implementation is yours; the
                guide has supplied the theory, the worked math, and the failure modes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">21.6</span> Check your understanding</h2>
        <div data-widget="minimal-llm-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">21.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(21, [
          "State the five success criteria of a minimal LLM.",
          "Choose a minimal architecture and justify each component.",
          "Write the six-step training loop.",
          "Diagnose the five common failure modes.",
          "Explain why optional optimizations should wait."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">21.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapters 7–8", source: "Training, regularization, and optimization" },
          { title: "Vaswani et al. (2017)", source: "The decoder-only architecture used here" },
          { title: "Kaplan et al. (2020)", source: "Why scale is a later decision, not the first one" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(21)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.createQuiz(root.querySelector('[data-widget="minimal-llm-quiz"]'), {
      id: "minimal-llm",
      chapterId: 21,
      title: "Minimal LLM checkpoint",
      subtitle: "Scope, loop, and debugging.",
      questions: [
        {
          prompt: "The first milestone is to:",
          options: [
            "Overfit a single small batch",
            "Train on the full corpus",
            "Add mixed precision",
            "Implement KV caching"
          ],
          answer: 0,
          explanation: "If the model cannot overfit one batch, the bug is in the model or training loop."
        },
        {
          prompt: "A loss stuck near $\\log V$ usually means:",
          options: [
            "Targets are not shifted or logits are disconnected",
            "The model is too small",
            "The tokenizer is too large",
            "The learning rate is too small"
          ],
          answer: 0,
          explanation: "The model is predicting a near-uniform distribution; check the input/target shift and the loss graph."
        },
        {
          prompt: "Which is not required for a minimal LLM?",
          options: ["Causal masking", "Stable cross-entropy", "KV caching", "A training loop"],
          answer: 2,
          explanation: "KV caching speeds up inference but is not needed to train or generate slowly."
        },
        {
          prompt: "A character-level tokenizer is attractive for a first model because:",
          options: [
            "It needs no tokenizer training",
            "It always produces better samples",
            "It removes the need for embeddings",
            "It eliminates the loss"
          ],
          answer: 0,
          explanation: "The vocabulary is just the character set, so the pipeline is simpler and deterministic."
        }
      ]
    });

    MS.ui.bindChecklist(root, 21);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[21] = true;
})();
