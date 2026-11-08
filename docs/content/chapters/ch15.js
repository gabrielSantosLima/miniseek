/* Chapter 15 — The attention mechanism. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(15);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part IV — Transformers <span class="dot"></span> Chapter 15</div>
        <h1 class="chapter-title">The Attention Mechanism</h1>
        <p class="chapter-goal">
          Derive scaled dot-product attention and multi-head attention from first
          principles, with full control over shapes and masks.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">14 hours</span>
          <span class="meta-pill">Attention Is All You Need §3.2</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#retrieval">Attention as retrieval</a>
          <a href="#scaled">Scaled dot product</a>
          <a href="#multihead">Multi-head and masks</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="retrieval">
        <h2 class="section-title"><span class="section-index">15.1</span> Attention as soft retrieval</h2>
        <div class="prose">
          <p>
            Attention lets each position ask a question and gather information from
            other positions. The question is a <strong>query</strong> $Q$; each
            position offers a <strong>key</strong> $K$ and a
            <strong>value</strong> $V$.
          </p>
          <p>
            The score between a query and a key measures relevance. After softmax,
            the scores become weights, and the output is a weighted average of the
            values. A high weight means “read from this position”; a low weight means
            “mostly ignore it.”
          </p>
          <div class="formula">
            $$Q=XW_Q,\\qquad K=XW_K,\\qquad V=XW_V$$
          </div>
          ${MS.ui.symbols([
            ["$X$", "The input sequence, with one row per token."],
            ["$W_Q,W_K,W_V$", "Learned projection matrices that produce queries, keys, and values."],
            ["$Q$", "Queries: what each position is looking for."],
            ["$K$", "Keys: what each position offers as a match."],
            ["$V$", "Values: the information that is actually averaged."]
          ])}
          <p>
            This is a soft, differentiable dictionary lookup. The model learns the
            projections, so it learns both what to ask and what to expose.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="scaled">
        <h2 class="section-title"><span class="section-index">15.2</span> Scaled dot-product attention</h2>
        <div class="prose">
          <p>
            The score matrix is $QK^T$. Each entry is the dot product of one query
            with one key. Softmax is applied row by row, so each query produces a
            distribution over keys:
          </p>
          <div class="formula">
            $$\\operatorname{Attention}(Q,K,V)
              =\\operatorname{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
          </div>
          ${MS.ui.symbols([
            ["$QK^T$", "The matrix of raw query–key scores; shape $n\\times n$ for a sequence of length $n$."],
            ["$d_k$", "The key/query dimension. The square root keeps the score variance from growing with dimension."],
            ["$\\operatorname{softmax}$", "Applied independently to each row, turning scores into weights that sum to one."],
            ["$V$", "The value matrix; the weights mix its rows into the output."]
          ])}
          <p>
            Without scaling, dot products of high-dimensional vectors tend to have
            large magnitude. A large logit makes the softmax nearly one-hot, which
            saturates gradients and makes training brittle. Dividing by
            $\\sqrt{d_k}$ keeps the scores in a useful range.
          </p>
          <p>
            The output has the same shape as $V$: one vector per query position. In
            self-attention, $Q$, $K$, and $V$ all come from the same sequence. In
            cross-attention, queries come from one sequence and keys/values from
            another.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="multihead">
        <h2 class="section-title"><span class="section-index">15.3</span> Multi-head attention and masks</h2>
        <div class="prose">
          <p>
            One attention pattern may not be enough. Multi-head attention runs
            several attention operations in parallel, each with its own projections,
            then concatenates and projects the results:
          </p>
          <div class="formula">
            $$\\text{head}_i
              =\\operatorname{Attention}(QW_Q^i,KW_K^i,VW_V^i),$$
            $$\\operatorname{MultiHead}(Q,K,V)
              =\\operatorname{Concat}(\\text{head}_1,\\ldots,\\text{head}_h)W_O.$$
          </div>
          ${MS.ui.symbols([
            ["$h$", "The number of heads."],
            ["$d_k=d_{model}/h$", "The per-head dimension."],
            ["$W_Q^i,W_K^i,W_V^i$", "Head-specific projections."],
            ["$W_O$", "The output projection that mixes the concatenated heads."],
            ["$\\operatorname{Concat}$", "Joins the head outputs along the feature dimension."]
          ])}
          <p>
            Masks modify the score matrix before softmax. A padding mask ignores
            padding tokens; a causal mask prevents position $i$ from attending to
            positions $j>i$, which is required for autoregressive generation. Masked
            entries are usually set to a large negative number so their softmax
            weight becomes zero.
          </p>
          <p>
            Attention is permutation-equivariant: if you reorder the tokens, the
            outputs reorder the same way. This is why Transformers need positional
            information. The score matrix costs $O(n^2)$ entries, so attention has
            quadratic time and memory complexity in sequence length.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Weights are not explanations</p>
              <p>
                Attention weights show where information is mixed, but they are not a
                complete explanation of the model's prediction. Multiple heads and
                later layers interact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">15.4</span> Worked example: a 3-token attention matrix</h2>
        <div class="prose">
          <p>
            Use three tokens with embeddings $\\mathbf{e}_1=(1,0)$,
            $\\mathbf{e}_2=(0,1)$, $\\mathbf{e}_3=(1,1)$. For simplicity set
            $Q=K=V=E$ and $d_k=2$.
          </p>
        </div>

        <div class="worked-example">
          <h3>Scale, softmax, mask, and mix</h3>
          <p class="example-intro">
            Compute the score matrix, then the row-wise attention weights with and
            without a causal mask.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Raw scores and scaling</h4>
              <p>
                $$E E^T=
                  \\begin{bmatrix}
                    1&0&1\\\\
                    0&1&1\\\\
                    1&1&2
                  \\end{bmatrix}.$$
                Dividing by $\\sqrt2\\approx1.4142$:
              </p>
              <p>
                $$S\\approx
                  \\begin{bmatrix}
                    0.7071&0&0.7071\\\\
                    0&0.7071&0.7071\\\\
                    0.7071&0.7071&1.4142
                  \\end{bmatrix}.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Softmax without a mask</h4>
              <p>
                Row 1 has scores $(0.7071,0,0.7071)$, so its weights are
                approximately $(0.4011,0.1978,0.4011)$.
                Row 2 gives $(0.1978,0.4011,0.4011)$.
                Row 3 gives $(0.2483,0.2483,0.5035)$.
                Each row sums to one.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Apply a causal mask</h4>
              <p>
                Row 1 may attend only to key 1, so its weights become
                $(1,0,0)$. Row 2 may attend to keys 1 and 2; its unmasked scores
                $(0,0.7071)$ become approximately $(0.3302,0.6698)$.
                Row 3 is unchanged because all keys are in the past.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Mix the values</h4>
              <p>
                Without a mask, the first output is
              </p>
              <p>
                $$\\mathbf{c}_1=0.4011(1,0)+0.1978(0,1)+0.4011(1,1)
                  \\approx(0.8022,0.5989).$$
                With the causal mask, the first output is simply
                $\\mathbf{c}_1=(1,0)$, because only the first token is visible.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the score matrix is symmetric because
            $Q=K$. Dividing by $\\sqrt2$ gives the values above; each softmax row
            sums to one; the causal mask sets future entries to zero and renormalizes
            the visible ones. The weighted sum $(0.8022,0.5989)$ lies in the convex
            hull of the encoder states.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">15.5</span> Lab</h2>
        <div data-widget="attention-heatmap"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">15.6</span> Check your understanding</h2>
        <div data-widget="attention-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">15.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(15, [
          "Write the scaled dot-product attention formula from memory.",
          "Explain the role of Q, K, and V.",
          "Explain why scaling by √d_k is necessary.",
          "Apply a causal mask correctly.",
          "Write the multi-head attention formula and trace all shapes.",
          "Explain why attention alone is permutation-equivariant."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">15.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Vaswani et al. (2017) — §3.2–3.3", source: "Scaled dot-product attention and multi-head attention" },
          { title: "Rush et al., The Annotated Transformer", source: "Optional: implementation-oriented walkthrough" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 10", source: "Sequence-model context" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(15)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.attentionHeatmap(root.querySelector('[data-widget="attention-heatmap"]'));

    MS.createQuiz(root.querySelector('[data-widget="attention-quiz"]'), {
      id: "attention",
      chapterId: 15,
      title: "Attention checkpoint",
      subtitle: "Queries, keys, values, and masks.",
      questions: [
        {
          prompt: "Which vector is used to score relevance against a key?",
          options: ["Value", "Query", "Output", "Bias"],
          answer: 1,
          explanation: "The query is compared with each key; the resulting weights mix the values."
        },
        {
          prompt: "Why divide the scores by $\\sqrt{d_k}$?",
          options: [
            "To make the output negative",
            "To keep the softmax from saturating as dimension grows",
            "To remove the bias",
            "To increase the sequence length"
          ],
          answer: 1,
          explanation: "Dot products grow with dimension; scaling stabilizes the logits and gradients."
        },
        {
          prompt: "A causal mask prevents:",
          options: [
            "Attending to future positions",
            "Attending to the current position",
            "Using values",
            "Computing queries"
          ],
          answer: 0,
          explanation: "Autoregressive models must not see tokens that have not been generated yet."
        },
        {
          prompt: "The attention score matrix for sequence length $n$ has:",
          options: ["$n$ entries", "$n^2$ entries", "$2n$ entries", "$d_k$ entries"],
          answer: 1,
          explanation: "Every query attends to every key, producing an $n\\times n$ matrix per head."
        },
        {
          prompt: "Attention without positional information is:",
          options: [
            "Permutation-equivariant",
            "Invariant to sequence order",
            "Always causal",
            "Linear in the vocabulary"
          ],
          answer: 0,
          explanation: "Reordering tokens reorders the outputs the same way; positional encodings break this symmetry."
        }
      ]
    });

    MS.ui.bindChecklist(root, 15);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[15] = true;
})();
