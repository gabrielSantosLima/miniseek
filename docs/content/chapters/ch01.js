/* Chapter 1 — Orientation. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(1);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part 0 — Orientation <span class="dot"></span> Chapter 1</div>
        <h1 class="chapter-title">Orientation: What “From Scratch” Really Means</h1>
        <p class="chapter-goal">
          Build an accurate map of the whole field before studying any single piece,
          so every later chapter has a place to attach to.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">4 hours</span>
          <span class="meta-pill">Reading + interactive</span>
          <span class="meta-pill">No implementation yet</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#llm-function">The LLM as a function</a>
          <a href="#pipeline">The pipeline</a>
          <a href="#ladder">The from-scratch ladder</a>
          <a href="#read-papers">Reading papers</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="llm-function">
        <h2 class="section-title"><span class="section-index">1.1</span> The LLM as a function</h2>
        <div class="prose">
          <p>
            A large language model is, mathematically, a parameterized function.
            It receives a sequence of tokens and returns a probability distribution
            over the next token:
          </p>
          <div class="formula">
            $$f_\\theta : \\text{tokens} \\to \\Delta^{V}$$
            <div class="formula-caption">$\\Delta^{V}$ is the set of probability distributions over a vocabulary of size $V$.</div>
          </div>
          ${MS.ui.symbols([
            ["$f_\\theta$", "The model as a whole: a function with fixed architecture and learned parameters $\\theta$."],
            ["$\\theta$", "The full parameter vector — every weight matrix, bias, embedding entry, and normalization scale."],
            ["$\\text{tokens}$", "The input sequence of discrete token IDs, usually preceded by a special beginning token."],
            ["$\\Delta^{V}$", "The probability simplex: all vectors of length $V$ with non-negative entries that sum to one."],
            ["$V$", "Vocabulary size — the number of distinct tokens the model can read or emit."]
          ])}
          <p>
            The output is not a token; it is a distribution over all tokens. During
            inference, a separate decoding rule — greedy selection, sampling, beam
            search — chooses one token from that distribution. This separation is
            important: the model's job is to score continuations, while decoding is
            a policy layered on top of those scores.
          </p>
          <p>
            The parameters $\\theta$ are not stored inside the formula above; they are
            the reason the formula is useful. Training searches for a setting of
            $\\theta$ that makes the observed text probable. Inference freezes
            $\\theta$ and evaluates the function on new context.
          </p>
          <p>
            Everything else — tokenization, embeddings, attention, training,
            sampling — exists to make this function useful, trainable, and
            efficient. The central training objective is next-token prediction:
          </p>
          <div class="formula">
            $$p(x_1,\\ldots,x_T)=\\prod_{t=1}^{T}p(x_t\\mid x_{&lt;t})$$
          </div>
          ${MS.ui.symbols([
            ["$x_1,\\ldots,x_T$", "A concrete token sequence of length $T$."],
            ["$x_t$", "The token at position $t$."],
            ["$x_{&lt;t}$", "The complete prefix before position $t$: $(x_1,\\ldots,x_{t-1})$."],
            ["$p(x_t\\mid x_{&lt;t})$", "The model's conditional probability of the next token given the prefix."],
            ["$\\prod_{t=1}^{T}$", "The product over all positions, which follows from repeatedly applying the chain rule of probability."]
          ])}
          <p>
            This factorization is why a decoder-only model can be trained on raw
            text: every position provides a supervised target, namely the next
            token. Training maximizes the log-likelihood, which is the same as
            minimizing the average negative log-likelihood:
          </p>
          <div class="formula">
            $$\\mathcal{L}(\\theta)=-\\frac{1}{T}\\sum_{t=1}^{T}\\log p_\\theta(x_t\\mid x_{&lt;t})$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathcal{L}(\\theta)$", "The average cross-entropy loss over the sequence."],
            ["$\\log p_\\theta(x_t\\mid x_{&lt;t})$", "The log-probability the model assigns to the correct next token."],
            ["$\\frac{1}{T}\\sum_{t=1}^{T}$", "Averaging over positions so that sequence length does not change the scale of the loss."]
          ])}
          <p>
            Minimizing this loss is equivalent to maximizing the probability of the
            training text under the model. The negative sign turns a maximization
            problem into a minimization problem, which is the form every gradient
            descent optimizer expects.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Key idea</p>
              <p>
                An LLM is not a database of sentences. It is a function that
                assigns probabilities to continuations, learned from data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="pipeline">
        <h2 class="section-title"><span class="section-index">1.2</span> The pipeline</h2>
        <div class="prose">
          <p>
            The end-to-end path from raw text to a next-token probability has five
            conceptual stages. Before looking at the answer, try to order them
            yourself.
          </p>
        </div>
        <div data-widget="pipeline"></div>
        <div class="prose">
          <p>
            The order matters because each stage changes the representation:
            strings become integer IDs, IDs become vectors, vectors become
            contextual representations, and representations become logits.
            The softmax is the final step that turns arbitrary scores into a
            probability distribution.
          </p>
          <p>
            More explicitly, if the tokenizer maps text to IDs
            $c_1,\\ldots,c_T$, the embedding matrix $E$ produces one vector per
            position, the Transformer produces contextual states $\\mathbf{h}_t$,
            and the output projection produces one logit per vocabulary entry:
          </p>
          <div class="formula">
            $$\\mathbf{e}_t=E[c_t],\\qquad
              \\mathbf{h}_1,\\ldots,\\mathbf{h}_T=\\operatorname{Transformer}(\\mathbf{e}_1,\\ldots,\\mathbf{e}_T),\\qquad
              \\mathbf{z}_t=W_U\\mathbf{h}_t+\\mathbf{b}_U$$
          </div>
          ${MS.ui.symbols([
            ["$c_t$", "The integer token ID at position $t$, produced by the tokenizer."],
            ["$E\\in\\mathbb{R}^{V\\times d_{model}}$", "The embedding matrix. Row $E[c_t]$ is the learned vector for token $c_t$."],
            ["$\\mathbf{e}_t\\in\\mathbb{R}^{d_{model}}$", "The input embedding at position $t$."],
            ["$\\mathbf{h}_t\\in\\mathbb{R}^{d_{model}}$", "The contextual hidden state after the Transformer blocks. It depends on the whole prefix."],
            ["$W_U\\in\\mathbb{R}^{V\\times d_{model}}$", "The output (unembedding) matrix that maps a hidden state to vocabulary logits."],
            ["$\\mathbf{z}_t\\in\\mathbb{R}^{V}$", "The logits: one unnormalized score per vocabulary token."],
            ["$\\mathbf{b}_U$", "The output bias, one scalar per vocabulary entry."]
          ])}
          <p>
            The logits become a distribution through the softmax:
          </p>
          <div class="formula">
            $$p_\\theta(x_{t+1}=v\\mid x_{&lt;t+1})
              =\\frac{\\exp(z_{t,v})}{\\sum_{u=1}^{V}\\exp(z_{t,u})}$$
          </div>
          ${MS.ui.symbols([
            ["$p_\\theta(x_{t+1}=v\\mid x_{&lt;t+1})$", "The probability assigned to vocabulary token $v$ as the next token."],
            ["$z_{t,v}$", "The logit for vocabulary entry $v$ at position $t$."],
            ["$\\exp(\\cdot)$", "The exponential function, which makes every score positive and amplifies differences."],
            ["$\\sum_{u=1}^{V}\\exp(z_{t,u})$", "The normalizer that forces all $V$ probabilities to sum to one."]
          ])}
          <p>
            The same embedding matrix is sometimes reused as the output matrix
            (weight tying), which reduces parameters and often improves
            generalization. The Transformer blocks are the only stage that mixes
            information across positions; tokenization, embedding lookup, and the
            final projection are otherwise position-wise operations.
          </p>
          <p>
            Two practical details matter from the start. First, a tokenizer is not
            neutral: character-level tokenizers keep the vocabulary small but make
            sequences long, while subword tokenizers such as BPE balance vocabulary
            size against sequence length. Second, the context window is finite. The
            model can only condition on the last $T$ tokens, so the choice of $T$
            is both an architectural and a computational decision.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="ladder">
        <h2 class="section-title"><span class="section-index">1.3</span> The from-scratch ladder</h2>
        <div class="prose">
          <p>
            “From scratch” does not mean writing a production training stack on
            day one. It means understanding and building each layer in order,
            with no hidden magic:
          </p>
          <ol>
            <li><strong>Scalar autodiff engine</strong> — a tiny reverse-mode engine over numbers and a few operations. It exposes the chain rule without any tensor abstractions.</li>
            <li><strong>Two-layer MLP</strong> — introduces layers, nonlinearities, mini-batch losses, and parameter updates on a problem you can visualize.</li>
            <li><strong>Character-level RNN</strong> — introduces time, parameter sharing, hidden state, and backpropagation through time on a small vocabulary.</li>
            <li><strong>LSTM or GRU</strong> — replaces the fragile recurrent state with gates and an additive memory path, and makes long-range credit assignment tangible.</li>
            <li><strong>Single Transformer block</strong> — replaces recurrence with self-attention, residual connections, and layer normalization.</li>
            <li><strong>Small decoder-only GPT</strong> — stacks blocks, adds tokenization and sampling, and turns the architecture into a language model.</li>
          </ol>
          <p>
            Each rung adds exactly one conceptual idea. Skipping a rung tends to
            produce a fragile understanding: a model that runs but cannot be
            debugged. The mathematics chapters come first because every item on
            this ladder is a composition of gradients, matrix products, and
            probability distributions. The later implementation phase will revisit
            each milestone, but it will not introduce new conceptual machinery.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Scope of this phase</p>
              <p>
                This guide is theory-first. No model is trained here. The capstone
                chapter produces a written design that the implementation phase
                will follow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="read-papers">
        <h2 class="section-title"><span class="section-index">1.4</span> How to read the papers</h2>
        <div class="prose">
          <p>
            Every primary source in this curriculum is read in three passes:
          </p>
          <ol>
            <li><strong>Orientation:</strong> title, abstract, figures, conclusion. Write the problem and the main mechanism in one sentence each.</li>
            <li><strong>Structure:</strong> section headings, topic sentences, mathematical objects, shapes. Write the central equation and three open questions.</li>
            <li><strong>Derivation:</strong> reproduce the main derivation or algorithm on paper, then compare it with the guide.</li>
          </ol>
          <p>
            A paper is complete only after the third pass. Reading without
            reproducing is recognition, not understanding.
          </p>
        </div>
        <ul class="reading-list">
          <li>Goodfellow, Bengio &amp; Courville, <em>Deep Learning</em>, Chapter 1.<span class="reading-source">Local PDF: references/deep-learning-book-goodfellow-2016.pdf</span></li>
          <li>Vaswani et al., <em>Attention Is All You Need</em>, abstract and introduction.<span class="reading-source">Local PDF: references/attention-is-all-you-need.pdf</span></li>
        </ul>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">1.5</span> Check your understanding</h2>
        <div data-widget="diagnostic"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">1.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(1, [
          "Draw the full text-to-next-token pipeline from memory.",
          "Explain the difference between training and inference.",
          "Explain why the chain rule is the central mathematical tool of the course.",
          "Set up a derivation notebook and an error log."
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(1)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.pipeline(root.querySelector('[data-widget="pipeline"]'));

    MS.createQuiz(root.querySelector('[data-widget="diagnostic"]'), {
      id: "diagnostic",
      chapterId: 1,
      title: "Diagnostic quiz",
      subtitle: "This is a calibration check, not a grade. Explanations appear after you submit.",
      questions: [
        {
          prompt: "What does an LLM predict at each position?",
          options: [
            "A single deterministic next token",
            "A probability distribution over the next token",
            "The whole document at once",
            "A vector of raw characters"
          ],
          answer: 1,
          explanation: "The model produces logits, and softmax turns them into a distribution over the vocabulary."
        },
        {
          prompt: "Which mathematical operation is the core of backpropagation?",
          options: ["Integration", "The chain rule", "Matrix inversion", "Fourier transform"],
          answer: 1,
          explanation: "Backpropagation applies the chain rule repeatedly through a computational graph."
        },
        {
          prompt: "What does attention allow a Transformer to do?",
          options: [
            "Process tokens strictly one at a time",
            "Route information between positions in parallel",
            "Replace the need for training data",
            "Guarantee grammatical output"
          ],
          answer: 1,
          explanation: "Self-attention computes pairwise interactions, so every position can gather information from others in parallel."
        },
        {
          prompt: "What is the output of the final linear layer of an LLM?",
          options: ["Token IDs", "Embeddings", "Logits", "Attention weights"],
          answer: 2,
          explanation: "The final projection produces one logit per vocabulary item; softmax converts those logits to probabilities."
        },
        {
          prompt: "What is the first rung of the from-scratch ladder?",
          options: [
            "A distributed training cluster",
            "A scalar automatic-differentiation engine",
            "A pretrained checkpoint",
            "A tokenizer-only pipeline"
          ],
          answer: 1,
          explanation: "A tiny autodiff engine exposes the mechanics that every larger model hides."
        }
      ]
    });

    MS.ui.bindChecklist(root, 1);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[1] = true;
})();
