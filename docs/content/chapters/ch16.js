/* Chapter 16 — The Transformer architecture. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(16);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part IV — Transformers <span class="dot"></span> Chapter 16</div>
        <h1 class="chapter-title">The Transformer Architecture</h1>
        <p class="chapter-goal">
          Understand every component of the original Transformer and trace a batch
          of tokens through the full encoder–decoder stack.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">20 hours</span>
          <span class="meta-pill">Attention Is All You Need</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#overview">Architecture overview</a>
          <a href="#components">Components</a>
          <a href="#shapes">Shapes and parameters</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="overview">
        <h2 class="section-title"><span class="section-index">16.1</span> Architecture overview</h2>
        <div class="prose">
          <p>
            The original Transformer is an encoder–decoder architecture built entirely
            from attention, feed-forward layers, residual connections, and
            normalization. It removes recurrence: every position can interact with
            every other position in parallel during training.
          </p>
          <p>
            The encoder maps the source sequence to contextual representations. The
            decoder generates the target sequence autoregressively, using masked
            self-attention, cross-attention to the encoder, and a feed-forward block.
          </p>
          <table>
            <thead><tr><th>Block</th><th>Encoder</th><th>Decoder</th></tr></thead>
            <tbody>
              <tr><td>Self-attention</td><td>Unmasked</td><td>Masked (causal)</td></tr>
              <tr><td>Cross-attention</td><td>None</td><td>Attends to encoder output</td></tr>
              <tr><td>Feed-forward</td><td>Position-wise</td><td>Position-wise</td></tr>
              <tr><td>Residual + norm</td><td>After each sublayer</td><td>After each sublayer</td></tr>
            </tbody>
          </table>
          <p>
            A decoder-only language model keeps the decoder stack and removes the
            encoder and cross-attention. That is the GPT-style architecture used in
            the rest of this guide.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Parallelism</p>
              <p>
                During training, all target positions can be processed at once because
                the causal mask prevents each position from seeing the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="components">
        <h2 class="section-title"><span class="section-index">16.2</span> Components</h2>
        <div class="prose">
          <p>
            <strong>Positional encoding.</strong> Attention is permutation-equivariant,
            so the model needs a signal for order. The original paper adds sinusoidal
            encodings to the token embeddings:
          </p>
          <div class="formula">
            $$PE_{(pos,2i)}=\\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right),\\qquad
              PE_{(pos,2i+1)}=\\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right).$$
          </div>
          ${MS.ui.symbols([
            ["$pos$", "The token position in the sequence."],
            ["$i$", "The dimension index within the encoding."],
            ["$d_{model}$", "The embedding dimension."],
            ["$10000^{2i/d_{model}}$", "A frequency that changes across dimensions, giving each position a unique pattern."]
          ])}
          <p>
            <strong>Feed-forward network.</strong> Each position passes through the
            same two-layer MLP independently:
          </p>
          <div class="formula">
            $$\\operatorname{FFN}(\\mathbf{x})
              =\\max(0,\\mathbf{x}W_1+\\mathbf{b}_1)W_2+\\mathbf{b}_2.$$
          </div>
          <p>
            The hidden width is usually a multiple of $d_{model}$ (four in the original
            paper). This is where most of the block's parameters live.
          </p>
          <p>
            <strong>Residual connections.</strong> Each sublayer is wrapped as
            $\\mathbf{x}+\\operatorname{Sublayer}(\\mathbf{x})$. The identity path gives
            gradients a direct route through the network and makes deep stacks
            trainable.
          </p>
          <p>
            <strong>Layer normalization.</strong> Layer norm normalizes the features of
            each example independently. Pre-norm applies it before each sublayer;
            post-norm applies it after the residual addition. Pre-norm is generally
            more stable at depth and is common in modern LLMs.
          </p>
          <p>
            <strong>Weight tying.</strong> The input embedding matrix and the output
            projection can share weights, reducing parameters and often improving
            generalization.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="shapes">
        <h2 class="section-title"><span class="section-index">16.3</span> Shapes and parameter counting</h2>
        <div class="prose">
          <p>
            For a decoder-only block with model width $d$, FFN width $f$, and $h$
            heads, the attention projections contribute:
          </p>
          <div class="formula">
            $$\\underbrace{3d^2+3d}_{Q,K,V}
              +\\underbrace{d^2+d}_{\\text{output projection}}
              +\\underbrace{2df+f+d}_{\\text{FFN}}
              +\\underbrace{4d}_{\\text{two layer norms}}.$$
          </div>
          <p>
            The per-block total is $4d^2+2df+f+9d$. The token embedding adds $Vd$,
            and the final layer norm adds $2d$. A useful shape check is:
          </p>
          <ul>
            <li>input IDs: $(B,T)$;</li>
            <li>embeddings: $(B,T,d)$;</li>
            <li>per-head Q/K/V: $(B,h,T,d/h)$;</li>
            <li>attention scores: $(B,h,T,T)$;</li>
            <li>FFN hidden: $(B,T,f)$;</li>
            <li>logits: $(B,T,V)$.</li>
          </ul>
          <p>
            The $T^2$ attention matrix is the main scaling cost in sequence length;
            the $Vd$ embedding table is often the largest single parameter tensor for
            a small model.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">16.4</span> Worked example: a tiny Transformer block</h2>
        <div class="prose">
          <p>
            Use $d=4$, $h=2$, $T=3$, $V=10$, $f=4d=16$, and one layer. Compute the
            parameter count and the shape of every tensor.
          </p>
        </div>

        <div class="worked-example">
          <h3>From token IDs to logits</h3>
          <p class="example-intro">
            The numbers are small enough to check by hand. The structure is identical
            to a full-size block.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Shapes</h4>
              <p>
                Input IDs $(3)$; embeddings $(3,4)$; per-head Q/K/V
                $(2,3,2)$; attention scores $(2,3,3)$; attention output
                $(3,4)$; FFN hidden $(3,16)$; logits $(3,10)$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Attention parameters</h4>
              <p>
                $$QKV=3\\cdot4^2+3\\cdot4=48+12=60,$$
                $$\\text{output projection}=4^2+4=16+4=20.$$
                Total attention parameters: $80$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>FFN and normalization parameters</h4>
              <p>
                $$FFN=2\\cdot4\\cdot16+16+4=128+20=148.$$
                Two layer norms add $4d=16$.
                Per-block total: $80+148+16=244$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Total model parameters</h4>
              <p>
                Embeddings: $Vd=10\\cdot4=40$.
                Final layer norm: $2d=8$.
                Total: $244+40+8=292$ parameters.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the formula gives
            $4d^2+2df+f+9d=64+128+16+36=244$ per block, matching the component
            sum. Adding $40$ embedding parameters and $8$ final-norm parameters gives
            $292$. The shape trace uses $d/h=2$ and $T=3$ consistently.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">16.5</span> Lab</h2>
        <div data-widget="transformer-shapes"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">16.6</span> Check your understanding</h2>
        <div data-widget="transformer-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">16.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(16, [
          "Draw the original Transformer encoder and decoder blocks.",
          "Explain the purpose of each sublayer.",
          "Write the sinusoidal positional encoding.",
          "Explain pre-norm vs post-norm.",
          "Trace shapes through a decoder-only block.",
          "Count parameters in a Transformer block.",
          "Explain why the architecture is parallelizable during training."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">16.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Vaswani et al. (2017) — full paper", source: "Attention Is All You Need" },
          { title: "Ba, Kiros & Hinton (2016)", source: "Layer Normalization" },
          { title: "Rush et al., The Annotated Transformer", source: "Optional implementation walkthrough" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(16)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.transformerShapes(root.querySelector('[data-widget="transformer-shapes"]'));

    MS.createQuiz(root.querySelector('[data-widget="transformer-quiz"]'), {
      id: "transformer",
      chapterId: 16,
      title: "Transformer checkpoint",
      subtitle: "Architecture, shapes, and parameter counts.",
      questions: [
        {
          prompt: "The decoder's self-attention uses a causal mask because:",
          options: [
            "It must not see future target tokens",
            "It has no keys",
            "It needs to attend to the source",
            "It removes positional information"
          ],
          answer: 0,
          explanation: "Autoregressive generation conditions only on the prefix, so future positions must be masked."
        },
        {
          prompt: "Residual connections mainly help by:",
          options: [
            "Providing a direct path for gradients",
            "Reducing the vocabulary",
            "Removing the need for normalization",
            "Making attention causal"
          ],
          answer: 0,
          explanation: "The identity path lets gradients bypass sublayers and stabilizes deep training."
        },
        {
          prompt: "Per-head Q/K/V tensors have shape:",
          options: ["$(B,h,T,d/h)$", "$(B,T,h)$", "$(T,T,V)$", "$(B,h,V,T)$"],
          answer: 0,
          explanation: "The model dimension is split across heads, giving head dimension $d/h$."
        },
        {
          prompt: "The FFN in a Transformer is applied:",
          options: ["Position-wise and independently", "Only at the first token", "Across the vocabulary", "Before tokenization"],
          answer: 0,
          explanation: "The same two-layer MLP is applied to each position's vector."
        },
        {
          prompt: "Pre-norm places layer normalization:",
          options: ["Before each sublayer", "After the final logits", "Only in the embedding", "Inside the loss"],
          answer: 0,
          explanation: "Pre-norm normalizes the input to each sublayer, which is generally more stable at depth."
        }
      ]
    });

    MS.ui.bindChecklist(root, 16);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[16] = true;
})();
