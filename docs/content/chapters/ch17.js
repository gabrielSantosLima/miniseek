/* Chapter 17 — From Transformer to LLM. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(17);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part IV — Transformers <span class="dot"></span> Chapter 17</div>
        <h1 class="chapter-title">From Transformer to LLM</h1>
        <p class="chapter-goal">
          Connect the architecture to the practical definition of a large language
          model: tokenization, next-token prediction, decoding, scaling, and
          evaluation.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">16 hours</span>
          <span class="meta-pill">GPT-3 · Scaling Laws</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#tokens">Tokens and objectives</a>
          <a href="#decoding">Decoding</a>
          <a href="#scaling">Scaling and evaluation</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="tokens">
        <h2 class="section-title"><span class="section-index">17.1</span> Tokens, embeddings, and the objective</h2>
        <div class="prose">
          <p>
            A language model does not read characters directly. A tokenizer maps text
            to integer IDs, and an embedding matrix maps each ID to a vector. Subword
            tokenizers such as byte-pair encoding (BPE) balance vocabulary size
            against sequence length: common words become one token, rare words are
            split into smaller pieces.
          </p>
          <p>
            A decoder-only LLM is trained with causal language modeling:
          </p>
          <div class="formula">
            $$p_\\theta(x_1,\\ldots,x_T)
              =\\prod_{t=1}^{T}p_\\theta(x_t\\mid x_{&lt;t}),$$
            $$\\mathcal{L}(\\theta)
              =-\\frac1T\\sum_{t=1}^{T}\\log p_\\theta(x_t\\mid x_{&lt;t}).$$
          </div>
          ${MS.ui.symbols([
            ["$x_t$", "The token at position $t$."],
            ["$x_{&lt;t}$", "The prefix before $t$."],
            ["$p_\\theta(x_t\\mid x_{&lt;t})$", "The probability the model assigns to the correct next token."],
            ["$\\mathcal{L}(\\theta)$", "Average negative log-likelihood, the cross-entropy loss."]
          ])}
          <p>
            Every position supplies a supervised target: the next token. Training is
            therefore self-supervised — no human labels are required beyond the raw
            text. The model learns to predict continuations, and that objective forces
            it to capture syntax, facts, and some reasoning patterns.
          </p>
          <p>
            The context window is finite. The model can condition only on the last
            $T$ tokens, and attention cost grows with $T^2$. Long-context models
            extend $T$ at a significant memory and compute cost.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="decoding">
        <h2 class="section-title"><span class="section-index">17.2</span> Decoding strategies</h2>
        <div class="prose">
          <p>
            The model produces a distribution; decoding chooses a token from it.
          </p>
          <ul>
            <li><strong>Greedy:</strong> take the highest-probability token at each step.</li>
            <li><strong>Beam search:</strong> keep several partial hypotheses and expand them.</li>
            <li><strong>Temperature sampling:</strong> divide logits by $T$ before softmax; lower $T$ sharpens, higher $T$ flattens.</li>
            <li><strong>Top-k:</strong> keep the $k$ most likely tokens and renormalize.</li>
            <li><strong>Top-p (nucleus):</strong> keep the smallest set of tokens whose cumulative probability reaches $p$, then renormalize.</li>
          </ul>
          <p>
            Temperature changes the shape of the distribution:
          </p>
          <div class="formula">
            $$p_i(T)=\\frac{\\exp(z_i/T)}{\\sum_j\\exp(z_j/T)}.$$
          </div>
          ${MS.ui.symbols([
            ["$z_i$", "The logit for token $i$."],
            ["$T$", "Temperature. $T<1$ sharpens; $T>1$ flattens; $T\\to0$ approaches greedy."],
            ["$p_i(T)$", "The temperature-adjusted probability."]
          ])}
          <p>
            During generation, the model does not need to recompute keys and values for
            the entire prefix at every step. A <strong>KV cache</strong> stores them,
            so each new token only computes one new query, key, and value. This makes
            autoregressive decoding much faster, at the cost of memory proportional to
            context length and layers.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Likelihood is not quality</p>
              <p>
                A high-probability continuation can be repetitive or unhelpful. Decoding
                and evaluation are separate from the training objective.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="scaling">
        <h2 class="section-title"><span class="section-index">17.3</span> Scaling, training stages, and evaluation</h2>
        <div class="prose">
          <p>
            Scaling laws describe how loss changes with parameters, data, and compute.
            Kaplan et al. (2020) found smooth power-law relationships and argued that
            model size and data should be scaled together rather than maximizing one
            alone. The practical lesson: compute is not free, and the allocation
            matters.
          </p>
          <p>
            Modern LLM training usually has three stages:
          </p>
          <ol>
            <li><strong>Pretraining</strong> — next-token prediction on a large text corpus.</li>
            <li><strong>Supervised fine-tuning</strong> — train on demonstrations of desired behavior.</li>
            <li><strong>Preference optimization / RLHF</strong> — align outputs with human preferences (high-level overview).</li>
          </ol>
          <p>
            Evaluation uses held-out loss and perplexity, task accuracy, and behavioral
            benchmarks. Perplexity is the exponential of average cross-entropy:
            $\\operatorname{PPL}=\\exp(\\mathcal{L})$. Lower is better, but perplexity
            does not measure truthfulness, safety, or usefulness.
          </p>
          <p>
            GPT-1, GPT-2, and GPT-3 mark a progression in scale and in-context
            learning. GPT-3's few-shot behavior emerges from scale and data diversity,
            not from a different objective. Bias, hallucination, data provenance, and
            licensing remain central concerns.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">17.4</span> Worked example: loss, perplexity, and top-p</h2>
        <div class="prose">
          <p>
            Suppose the vocabulary is three tokens and the model produces logits
            $(2,1,0)$. The correct next token is the second one.
          </p>
        </div>

        <div class="worked-example">
          <h3>From logits to a training signal</h3>
          <p class="example-intro">
            Compute softmax, cross-entropy, perplexity, and a top-p truncation.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Softmax</h4>
              <p>
                $$e^2\\approx7.3891,\\quad e^1\\approx2.7183,\\quad e^0=1,$$
                $$\\sum=11.1073,$$
                $$\\mathbf{p}\\approx(0.6652,0.2447,0.0900).$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Cross-entropy for the correct class</h4>
              <p>
                The target is one-hot on the second token, so
              </p>
              <p>
                $$L=-\\log(0.2447)\\approx1.4076\\ \\text{nats}.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Perplexity</h4>
              <p>
                $$\\operatorname{PPL}=\\exp(1.4076)\\approx4.0862.$$
                Perplexity is the effective number of equally likely choices the model
                is uncertain among.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Top-p truncation at 0.9</h4>
              <p>
                Sort by probability: $0.6652,0.2447,0.0900$. The cumulative sums are
                $0.6652$ and $0.9099$. Top-p $=0.9$ keeps the first two tokens and
                renormalizes:
              </p>
              <p>
                $$p'=\\left(\\frac{0.6652}{0.9099},
                  \\frac{0.2447}{0.9099}\\right)
                  \\approx(0.7311,0.2689).$$
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the softmax sums to one; the negative log of the
            correct class is $1.4076$; exponentiation gives $4.0862$; the top-p set
            contains exactly two tokens and its renormalized probabilities sum to one.
            These four numbers are consistent with the definitions.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">17.5</span> Lab</h2>
        <div data-widget="sampling-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">17.6</span> Check your understanding</h2>
        <div data-widget="llm-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">17.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(17, [
          "Write the autoregressive factorization of a sequence probability.",
          "Explain BPE at a conceptual level.",
          "Derive the next-token cross-entropy loss.",
          "Compare greedy, beam, and nucleus sampling.",
          "Explain what a KV cache stores and why it helps.",
          "Interpret a scaling-law curve.",
          "Explain the difference between pretraining and fine-tuning."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">17.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Vaswani et al. (2017)", source: "Attention Is All You Need" },
          { title: "Brown et al. (2020)", source: "Language Models are Few-Shot Learners (GPT-3)" },
          { title: "Kaplan et al. (2020)", source: "Scaling Laws for Neural Language Models" },
          { title: "Mikolov et al. (2013)", source: "Efficient Estimation of Word Representations in Vector Space" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(17)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.samplingLab(root.querySelector('[data-widget="sampling-lab"]'));

    MS.createQuiz(root.querySelector('[data-widget="llm-quiz"]'), {
      id: "llm",
      chapterId: 17,
      title: "LLM checkpoint",
      subtitle: "Objective, decoding, and evaluation.",
      questions: [
        {
          prompt: "A decoder-only language model is trained to:",
          options: [
            "Predict the next token given the prefix",
            "Predict the previous token",
            "Classify documents",
            "Translate without data"
          ],
          answer: 0,
          explanation: "The causal objective factorizes the sequence probability into next-token conditionals."
        },
        {
          prompt: "Lower temperature generally makes the distribution:",
          options: ["Sharper", "More uniform", "Undefined", "Symmetric"],
          answer: 0,
          explanation: "Dividing logits by a smaller temperature increases differences between probabilities."
        },
        {
          prompt: "Top-p sampling keeps:",
          options: [
            "The smallest set of tokens whose cumulative probability reaches p",
            "Exactly p tokens",
            "Only the first token",
            "All tokens with probability above 0.5"
          ],
          answer: 0,
          explanation: "The nucleus is the smallest high-probability set whose cumulative mass reaches p."
        },
        {
          prompt: "A KV cache improves inference by:",
          options: [
            "Reusing keys and values for the prefix",
            "Reducing the vocabulary",
            "Removing attention",
            "Increasing the temperature"
          ],
          answer: 0,
          explanation: "Each new token only needs one new query, key, and value; the prefix is cached."
        },
        {
          prompt: "Perplexity is:",
          options: [
            "$\\exp(\\text{average cross-entropy})$",
            "The vocabulary size",
            "The learning rate",
            "The number of layers"
          ],
          answer: 0,
          explanation: "Perplexity exponentiates the average negative log-likelihood."
        }
      ]
    });

    MS.ui.bindChecklist(root, 17);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[17] = true;
})();
