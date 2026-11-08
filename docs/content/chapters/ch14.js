/* Chapter 14 — Sequence-to-sequence and attention before Transformers. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(14);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part III — Sequence Models <span class="dot"></span> Chapter 14</div>
        <h1 class="chapter-title">Sequence-to-Sequence and the Road to Attention</h1>
        <p class="chapter-goal">
          Understand the encoder–decoder framework, the fixed-context bottleneck, and
          why attention was introduced before Transformers.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">12 hours</span>
          <span class="meta-pill">Sutskever 2014 · Bahdanau 2014</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#encoder-decoder">Encoder–decoder</a>
          <a href="#attention">Attention</a>
          <a href="#training">Training and decoding</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="encoder-decoder">
        <h2 class="section-title"><span class="section-index">14.1</span> Encoder–decoder and the bottleneck</h2>
        <div class="prose">
          <p>
            Sequence-to-sequence models map one sequence to another: translation,
            summarization, dialogue, or transcription. The standard architecture uses
            an encoder to read the source and a decoder to generate the target.
          </p>
          <p>
            The encoder processes the source tokens and produces a final hidden state
            (or a set of states). The decoder starts from that representation and
            generates one target token at a time:
          </p>
          <div class="formula">
            $$\\mathbf{h}^{\\text{enc}}_1,\\ldots,\\mathbf{h}^{\\text{enc}}_S
              =\\operatorname{Encoder}(\\mathbf{x}_1,\\ldots,\\mathbf{x}_S),$$
            $$\\mathbf{s}_t=\\operatorname{Decoder}(\\mathbf{s}_{t-1},\\mathbf{y}_{t-1},
              \\mathbf{c}),\\qquad
              p(y_t\\mid y_{&lt;t},\\mathbf{x})=\\operatorname{softmax}(W_o\\mathbf{s}_t).$$
          </div>
          ${MS.ui.symbols([
            ["$S$", "Source sequence length."],
            ["$\\mathbf{h}^{\\text{enc}}_s$", "Encoder hidden state at source position $s$."],
            ["$\\mathbf{s}_t$", "Decoder hidden state at target position $t$."],
            ["$\\mathbf{y}_{t-1}$", "The previously generated target token (or the ground-truth token during teacher forcing)."],
            ["$\\mathbf{c}$", "The context vector passed from encoder to decoder."],
            ["$W_o$", "Output projection to vocabulary logits."]
          ])}
          <p>
            In the original fixed-context formulation, $\\mathbf{c}$ is the encoder's
            final state. Everything the decoder knows about the source must pass
            through that one vector. This is the <strong>bottleneck</strong>: long or
            information-dense sources lose detail before decoding begins.
          </p>
          <p>
            Sutskever et al. (2014) showed that a deep LSTM encoder–decoder could
            translate well, especially when the source was reversed, but the
            fixed-size context remained a structural limitation.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">One vector is not enough</p>
              <p>
                A fixed context forces the encoder to compress the entire source into
                the same number of dimensions regardless of source length.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="attention">
        <h2 class="section-title"><span class="section-index">14.2</span> Attention as a learned alignment</h2>
        <div class="prose">
          <p>
            Bahdanau et al. (2014) replaced the single context vector with a
            weighted combination of all encoder states. At each decoder step, the
            model scores every encoder state against the current decoder state and
            normalizes the scores:
          </p>
          <div class="formula">
            $$e_{t,s}=\\mathbf{v}^T\\tanh(W_s\\mathbf{s}_{t-1}+W_h\\mathbf{h}^{\\text{enc}}_s),$$
            $$\\alpha_{t,s}=\\frac{\\exp(e_{t,s})}{\\sum_{s'}\\exp(e_{t,s'})},$$
            $$\\mathbf{c}_t=\\sum_s\\alpha_{t,s}\\mathbf{h}^{\\text{enc}}_s.$$
          </div>
          ${MS.ui.symbols([
            ["$e_{t,s}$", "Alignment score between decoder step $t$ and source position $s$."],
            ["$\\mathbf{s}_{t-1}$", "Previous decoder state, used as the query."],
            ["$\\mathbf{h}^{\\text{enc}}_s$", "Encoder state at source position $s$, used as a key/value."],
            ["$W_s,W_h,\\mathbf{v}$", "Learned parameters of the additive attention layer."],
            ["$\\alpha_{t,s}$", "Attention weight; non-negative and sums to one over source positions."],
            ["$\\mathbf{c}_t$", "Context vector: a weighted average of encoder states."]
          ])}
          <p>
            The weights form an <strong>alignment matrix</strong>: rows are decoder
            steps and columns are source positions. A high weight means the decoder is
            looking at that source position. The context vector changes at every
            decoder step, so the model no longer has to compress the whole source into
            one fixed vector.
          </p>
          <p>
            The same pattern — score, normalize, weighted sum — is the core of
            scaled dot-product attention in Transformers. The difference is that
            Bahdanau attention is additive and recurrent, while the Transformer uses
            dot products and removes recurrence entirely.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="training">
        <h2 class="section-title"><span class="section-index">14.3</span> Teacher forcing and decoding</h2>
        <div class="prose">
          <p>
            During training, the decoder is typically fed the ground-truth previous
            token instead of its own prediction. This is <strong>teacher forcing</strong>.
            It stabilizes and parallelizes training, but it creates a mismatch:
            at inference time the model must condition on its own generated tokens.
            That mismatch is called <strong>exposure bias</strong>.
          </p>
          <p>
            Decoding strategies determine how a trained model produces a sequence:
          </p>
          <ul>
            <li><strong>Greedy decoding</strong> — choose the most probable token at each step.</li>
            <li><strong>Beam search</strong> — keep the top $k$ partial hypotheses and expand them.</li>
            <li><strong>Sampling</strong> — draw tokens from the predicted distribution, optionally with temperature.</li>
          </ul>
          <p>
            Beam search can find a higher-probability sequence than greedy decoding,
            but it is not guaranteed to find the global optimum and can favor bland
            outputs. The beam width controls the cost–quality trade-off.
          </p>
          <p>
            Word embeddings provide the input representation for both encoder and
            decoder. The distributional hypothesis — words used in similar contexts
            have similar meanings — motivates learned vector representations such as
            word2vec.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">14.4</span> Worked example: attention weights and context</h2>
        <div class="prose">
          <p>
            Use three encoder states and one query. The vectors are chosen so the
            dot products and softmax are easy to check by hand.
          </p>
        </div>

        <div class="worked-example">
          <h3>Score, normalize, and combine</h3>
          <p class="example-intro">
            Let $\\mathbf{e}_1=(2,0)$, $\\mathbf{e}_2=(0,1)$,
            $\\mathbf{e}_3=(1,1)$, and $\\mathbf{q}=(1,0)$.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Compute the alignment scores</h4>
              <p>
                $$s_i=\\mathbf{q}\\cdot\\mathbf{e}_i,$$
                $$s_1=1\\cdot2+0\\cdot0=2,$$
                $$s_2=1\\cdot0+0\\cdot1=0,$$
                $$s_3=1\\cdot1+0\\cdot1=1.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Apply softmax</h4>
              <p>
                $$e^2\\approx7.3891,\\quad e^0=1,\\quad e^1\\approx2.7183,$$
                $$\\sum_i e^{s_i}\\approx11.1073,$$
                $$\\alpha\\approx(0.6652,0.0900,0.2447).$$
                The weights sum to one, and the first state receives the most
                attention.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Form the context vector</h4>
              <p>
                $$\\mathbf{c}=\\sum_i\\alpha_i\\mathbf{e}_i
                  =0.6652(2,0)+0.0900(0,1)+0.2447(1,1).$$
                $$\\mathbf{c}\\approx(1.3304+0.2447,\\ 0.0900+0.2447)
                  =(1.5751,0.3348).$$
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the scores are $2,0,1$; the exponential values
            are $7.3891,1,2.7183$; their sum is $11.1073$; the weights are
            $0.6652,0.0900,0.2447$ and sum to $1$. The context is the weighted
            average, so its coordinates lie between the smallest and largest encoder
            coordinates. Recomputing the weighted sum gives $(1.5751,0.3348)$.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">14.5</span> Lab</h2>
        <div data-widget="attention-preview"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">14.6</span> Check your understanding</h2>
        <div data-widget="seq2seq-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">14.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(14, [
          "Draw an encoder–decoder architecture.",
          "Explain the fixed-context bottleneck.",
          "Write the Bahdanau attention score and context vector.",
          "Explain teacher forcing and exposure bias.",
          "Explain why attention motivates self-attention."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">14.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Sutskever, Vinyals & Le (2014)", source: "Sequence to Sequence Learning with Neural Networks" },
          { title: "Bahdanau, Cho & Bengio (2014)", source: "Neural Machine Translation by Jointly Learning to Align and Translate" },
          { title: "Mikolov et al. (2013)", source: "Efficient Estimation of Word Representations in Vector Space" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(14)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.attentionPreview(root.querySelector('[data-widget="attention-preview"]'));

    MS.createQuiz(root.querySelector('[data-widget="seq2seq-quiz"]'), {
      id: "seq2seq",
      chapterId: 14,
      title: "Seq2seq checkpoint",
      subtitle: "Bottlenecks, alignment, and decoding.",
      questions: [
        {
          prompt: "The fixed-context bottleneck means:",
          options: [
            "The decoder sees only one summary vector for the whole source",
            "The encoder has too many layers",
            "The vocabulary is too small",
            "The loss is not differentiable"
          ],
          answer: 0,
          explanation: "In the original formulation the final encoder state must carry all source information."
        },
        {
          prompt: "Attention weights at one decoder step:",
          options: [
            "Can be negative",
            "Sum to one over source positions",
            "Are always uniform",
            "Replace the decoder"
          ],
          answer: 1,
          explanation: "They are produced by a softmax, so they are non-negative and sum to one."
        },
        {
          prompt: "Teacher forcing feeds the decoder:",
          options: [
            "Its own previous prediction",
            "The ground-truth previous token during training",
            "Random tokens",
            "Only the context vector"
          ],
          answer: 1,
          explanation: "This stabilizes training but creates a train/inference mismatch called exposure bias."
        },
        {
          prompt: "Beam search keeps:",
          options: [
            "The single best hypothesis",
            "The top k partial hypotheses",
            "All possible sequences",
            "Only the first token"
          ],
          answer: 1,
          explanation: "Beam width k controls the cost–quality trade-off by expanding several hypotheses."
        },
        {
          prompt: "Why does attention motivate self-attention?",
          options: [
            "It removes the need for probability",
            "It shows that learned weighting over positions is useful without a fixed bottleneck",
            "It makes recurrence mandatory",
            "It eliminates the decoder"
          ],
          answer: 1,
          explanation: "Self-attention generalizes the score-and-weight pattern to interactions among positions in the same sequence."
        }
      ]
    });

    MS.ui.bindChecklist(root, 14);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[14] = true;
})();
