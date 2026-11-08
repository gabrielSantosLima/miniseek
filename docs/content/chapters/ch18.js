/* Chapter 18 — Capstone blueprint. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(18);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part V — Capstone Blueprint <span class="dot"></span> Chapter 18</div>
        <h1 class="chapter-title">Capstone Blueprint: Design Your LLM</h1>
        <p class="chapter-goal">
          Produce a complete written design for the later implementation phase,
          without writing implementation code.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">8 hours</span>
          <span class="meta-pill">Design only</span>
          <span class="meta-pill">1 interactive planner</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#choices">Design choices</a>
          <a href="#budget">Parameter and compute budget</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="choices">
        <h2 class="section-title"><span class="section-index">18.1</span> The design choices</h2>
        <div class="prose">
          <p>
            The capstone is a written architecture decision record. It should specify:
          </p>
          <ul>
            <li><strong>Scale:</strong> character-level tiny GPT (1–10M parameters), a small BPE model (10–50M), or a CPU-friendly educational model.</li>
            <li><strong>Data:</strong> corpus, license, cleaning, deduplication, and held-out splits.</li>
            <li><strong>Tokenizer:</strong> character, BPE, WordPiece, or SentencePiece; vocabulary size and special tokens.</li>
            <li><strong>Architecture:</strong> layers, $d_{model}$, heads, context length, FFN multiplier, normalization placement, dropout.</li>
            <li><strong>Training:</strong> optimizer, schedule, batch size, gradient accumulation, evaluation interval, checkpointing.</li>
            <li><strong>Evaluation:</strong> validation loss/perplexity, samples, ablations, and task-specific checks.</li>
            <li><strong>Risks:</strong> overfitting, leakage, instability, tokenizer bugs, compute limits.</li>
          </ul>
          <p>
            Every choice should have a reason and a fallback. The goal is not the
            largest possible model; it is a model you can train, debug, and evaluate
            reproducibly.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Write the plan before the code</p>
              <p>
                A clear config file, evaluation plan, and milestone list prevent most
                of the confusion that appears during implementation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="budget">
        <h2 class="section-title"><span class="section-index">18.2</span> Parameter and compute budget</h2>
        <div class="prose">
          <p>
            Use the parameter formula from Chapter 16. For a decoder-only model with
            $L$ layers, width $d$, vocabulary $V$, and FFN width $f$:
          </p>
          <div class="formula">
            $$N\\approx L(4d^2+2df+f+9d)+Vd+2d.$$
          </div>
          ${MS.ui.symbols([
            ["$N$", "Total number of trainable parameters."],
            ["$L$", "Number of Transformer blocks."],
            ["$d$", "Model width $d_{model}$."],
            ["$f$", "FFN hidden width."],
            ["$V$", "Vocabulary size."]
          ])}
          <p>
            Two budgets matter:
          </p>
          <ul>
            <li><strong>Memory</strong> — parameters, gradients, optimizer states, activations, and the KV cache.</li>
            <li><strong>Compute</strong> — roughly proportional to parameters times tokens for training, plus the attention $T^2$ term.</li>
          </ul>
          <p>
            A common rough estimate for training compute is $6N$ FLOPs per token
            (forward plus backward), but this is an approximation, not a substitute
            for profiling.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">18.3</span> Worked example: size a small GPT</h2>
        <div class="prose">
          <p>
            Consider $L=4$, $d=128$, $h=4$, $T=128$, $V=10000$, and an FFN
            multiplier of $4$, so $f=512$. Batch size is $1$.
          </p>
        </div>

        <div class="worked-example">
          <h3>From config to budget</h3>
          <p class="example-intro">
            Compute the per-block parameters, the total, the attention matrix, the KV
            cache, and the logits tensor.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Per-block parameters</h4>
              <p>
                $$4d^2=4\\cdot128^2=65{,}536,$$
                $$2df=2\\cdot128\\cdot512=131{,}072,$$
                $$f+9d=512+1{,}152=1{,}664.$$
                Total per block: $65{,}536+131{,}072+1{,}664=198{,}272$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Total parameters</h4>
              <p>
                Four blocks: $4\\cdot198{,}272=793{,}088$.
                Embeddings: $Vd=10{,}000\\cdot128=1{,}280{,}000$.
                Final norm: $2d=256$.
                Total: $793{,}088+1{,}280{,}000+256=2{,}073{,}344$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Attention and KV cache</h4>
              <p>
                Per layer, the attention matrix has $hT^2=4\\cdot128^2=65{,}536$
                entries. Across four layers, $262{,}144$ entries.
              </p>
              <p>
                The KV cache in FP16 uses
                $2\\cdot L\\cdot T\\cdot d\\cdot 2$ bytes
                $=2\\cdot4\\cdot128\\cdot128\\cdot2=262{,}144$ bytes,
                about $0.262$ MB for this batch.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Logits and training compute</h4>
              <p>
                Logits: $BTV=1\\cdot128\\cdot10{,}000=1{,}280{,}000$ values.
                Training FLOPs per token are roughly $6N\\approx12{,}440{,}064$.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the per-block formula gives
            $4d^2+2df+f+9d=65{,}536+131{,}072+512+1{,}152=198{,}272$.
            Four blocks plus embeddings and the final norm give $2{,}073{,}344$.
            The attention and KV-cache counts use $T=128$ and $d=128$ consistently.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">18.4</span> Lab</h2>
        <div data-widget="capstone-planner"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">18.5</span> Check your understanding</h2>
        <div data-widget="capstone-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">18.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(18, [
          "Write a complete architecture specification.",
          "Justify every hyperparameter choice.",
          "Estimate parameter count and training cost.",
          "Define evaluation criteria before training.",
          "Identify the top five risks and mitigations.",
          "Produce a milestone plan for the implementation phase."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">18.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Kaplan et al. (2020)", source: "Scaling Laws for Neural Language Models" },
          { title: "Brown et al. (2020)", source: "Language Models are Few-Shot Learners (GPT-3)" },
          { title: "Vaswani et al. (2017)", source: "Attention Is All You Need" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(18)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.capstonePlanner(root.querySelector('[data-widget="capstone-planner"]'));

    MS.createQuiz(root.querySelector('[data-widget="capstone-quiz"]'), {
      id: "capstone",
      chapterId: 18,
      title: "Capstone checkpoint",
      subtitle: "Design decisions and budgets.",
      questions: [
        {
          prompt: "The capstone document should be written:",
          options: ["Before implementation", "After training", "Instead of evaluation", "Only after deployment"],
          answer: 0,
          explanation: "A written config, evaluation plan, and risk register guide the implementation."
        },
        {
          prompt: "The largest single tensor in a small model is often:",
          options: ["The token embedding table", "The bias vector", "The loss", "The learning rate"],
          answer: 0,
          explanation: "The embedding table has $Vd$ entries and can dominate a small model's parameter count."
        },
        {
          prompt: "Attention cost grows with:",
          options: ["$T^2$", "$T$", "$V$", "The number of epochs"],
          answer: 0,
          explanation: "The score matrix has one entry per query–key pair."
        },
        {
          prompt: "A good evaluation plan includes:",
          options: [
            "Held-out loss and task-specific checks",
            "Only training loss",
            "Only sample screenshots",
            "No baseline"
          ],
          answer: 0,
          explanation: "Evaluation should combine quantitative held-out metrics with qualitative and task-specific checks."
        }
      ]
    });

    MS.ui.bindChecklist(root, 18);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[18] = true;
})();
