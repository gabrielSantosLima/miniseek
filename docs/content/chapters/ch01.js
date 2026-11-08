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
          <p>
            Everything else — tokenization, embeddings, attention, training,
            sampling — exists to make this function useful, trainable, and
            efficient. The central training objective is next-token prediction:
          </p>
          <div class="formula">
            $$p(x_1,\\ldots,x_T)=\\prod_{t=1}^{T}p(x_t\\mid x_{<t})$$
          </div>
          <p>
            This factorization is why a decoder-only model can be trained on raw
            text: every position provides a supervised target, namely the next
            token.
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
            <li>a scalar automatic-differentiation engine,</li>
            <li>a two-layer MLP trained on a toy problem,</li>
            <li>a character-level RNN,</li>
            <li>an LSTM or GRU,</li>
            <li>a single Transformer block,</li>
            <li>a small decoder-only GPT-style model.</li>
          </ol>
          <p>
            The mathematics chapters come first because every item on this ladder
            is a composition of gradients, matrix products, and probability
            distributions. The later implementation phase will revisit each
            milestone, but it will not introduce new conceptual machinery.
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
