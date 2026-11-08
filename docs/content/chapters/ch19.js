/* Chapter 19 — Causal language modeling data pipeline. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(19);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part VI — Minimal LLM Bridge <span class="dot"></span> Chapter 19</div>
        <h1 class="chapter-title">Causal Language Modeling Data Pipeline</h1>
        <p class="chapter-goal">
          Turn a text corpus into the input/target batches that train a
          decoder-only language model.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">4 hours</span>
          <span class="meta-pill">Data pipeline only</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#tokens">Tokens and windows</a>
          <a href="#shift">Input/target shift</a>
          <a href="#batching">Batching and padding</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="tokens">
        <h2 class="section-title"><span class="section-index">19.1</span> From corpus to token windows</h2>
        <div class="prose">
          <p>
            The training pipeline starts with a corpus and a tokenizer. After
            tokenization, the corpus is one long sequence of integer IDs. The model
            never sees the whole corpus at once; it sees fixed-length windows.
          </p>
          <p>
            For a context length $T$, a window contains $T$ input tokens. The target
            is the same window shifted by one position, because the model must predict
            the next token at every position:
          </p>
          <div class="formula">
            $$\\mathbf{x}=[c_i,c_{i+1},\\ldots,c_{i+T-1}],\\qquad
              \\mathbf{y}=[c_{i+1},c_{i+2},\\ldots,c_{i+T}].$$
          </div>
          ${MS.ui.symbols([
            ["$c_i$", "The token ID at corpus position $i$."],
            ["$T$", "Context length: the number of input positions in one window."],
            ["$\\mathbf{x}$", "Input window, shape $(T)$ before batching."],
            ["$\\mathbf{y}$", "Target window, also shape $(T)$: the next token for every input position."]
          ])}
          <p>
            Windows can be non-overlapping (stride $T$), overlapping (stride $1$ or a
            small value), or packed from several documents. Non-overlapping windows
            are the simplest choice for a first implementation.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">One token of overlap</p>
              <p>
                The target window needs the token after the last input token, so a
                corpus of $N$ tokens yields at most $N-T$ full windows. The final
                partial window is usually dropped or padded.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="shift">
        <h2 class="section-title"><span class="section-index">19.2</span> The shift is the whole objective</h2>
        <div class="prose">
          <p>
            The causal mask already prevents position $t$ from seeing the future. The
            target shift supplies the supervision: at position $t$, the correct answer
            is the token that originally appeared at position $t+1$.
          </p>
          <p>
            A concrete way to remember the shapes is:
          </p>
          <ul>
            <li>input: positions $0$ to $T-1$;</li>
            <li>target: positions $1$ to $T$;</li>
            <li>loss: compare the $T$ predictions with the $T$ targets;</li>
            <li>no target is needed for the very last token of the corpus, because there is no next token.</li>
          </ul>
          <p>
            This is why the data loader needs one more token than the context length.
            If you accidentally use the same window for input and target, the model
            learns the identity function and the loss collapses for the wrong reason.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="batching">
        <h2 class="section-title"><span class="section-index">19.3</span> Batching, padding, and leakage</h2>
        <div class="prose">
          <p>
            A batch stacks several windows into shape $(B,T)$. If the windows have
            different lengths, the shorter ones are padded. Padding tokens must be
            ignored by the loss, usually by setting their target labels to a sentinel
            such as $-100$ and using an ignore-index in cross-entropy.
          </p>
          <p>
            For a language model, a simple batching scheme is:
          </p>
          <ol>
            <li>Tokenize the whole training corpus.</li>
            <li>Split into consecutive windows of length $T+1$.</li>
            <li>Use the first $T$ tokens as input and the last $T$ as target.</li>
            <li>Shuffle the windows, group them into batches, and move them to the device.</li>
            <li>Repeat for the validation corpus with the same tokenizer.</li>
          </ol>
          <p>
            Two leakage risks matter. First, the validation split must be made at the
            document level, not after tokenization, or near-duplicate text can appear
            in both splits. Second, the tokenizer must be fit on the training corpus
            only; fitting it on the full corpus leaks validation statistics.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">Padding is not data</p>
              <p>
                If padding tokens contribute to the loss, the model learns to predict
                padding. Mask them out. The same applies to document-boundary tokens
                that should not be predicted.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">19.4</span> Worked example: two windows</h2>
        <div class="prose">
          <p>
            Take the token sequence
            <code>the cat sat on the mat and the dog</code> and set $T=4$ with
            non-overlapping windows.
          </p>
        </div>

        <div class="worked-example">
          <h3>Build the input/target pairs</h3>
          <p class="example-intro">
            The corpus has 9 tokens, so there are two full windows of length 4 plus
            one leftover token.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Window 1</h4>
              <p>
                Input positions $0..3$: <code>the cat sat on</code>.<br>
                Target positions $1..4$: <code>cat sat on the</code>.
              </p>
              <p>
                At position 0 the model must predict <code>cat</code>; at position 1
                it must predict <code>sat</code>; and so on.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Window 2</h4>
              <p>
                Input positions $4..7$: <code>the mat and the</code>.<br>
                Target positions $5..8$: <code>mat and the dog</code>.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Shapes</h4>
              <p>
                Two windows give input shape $(2,4)$ and target shape $(2,4)$.
                If the final token is kept only as a target, the effective corpus
                coverage is 8 predicted tokens.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Padding example</h4>
              <p>
                If a batch contains a length-4 window and a length-2 window, pad the
                second to length 4 with token ID 0 and set its last two target labels
                to $-100$ so they do not contribute to the loss.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> every target is the input shifted by one
            position. Window 1 predicts <code>cat sat on the</code>; window 2
            predicts <code>mat and the dog</code>. The two windows use 8 predicted
            tokens, and the final corpus token has no next-token target.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">19.5</span> Lab</h2>
        <div data-widget="data-pipeline"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">19.6</span> Check your understanding</h2>
        <div data-widget="data-pipeline-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">19.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(19, [
          "Explain why the target is the input shifted by one token.",
          "Build non-overlapping windows from a token sequence.",
          "Explain why padding labels must be ignored.",
          "Describe how to split train and validation without leakage.",
          "State the shape of a batch before and after stacking."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">19.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 10", source: "Sequence modeling and training data" },
          { title: "Vaswani et al. (2017)", source: "Causal masking in the decoder" },
          { title: "Kaplan et al. (2020)", source: "Scaling laws and token counts" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(19)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.dataPipeline(root.querySelector('[data-widget="data-pipeline"]'));

    MS.createQuiz(root.querySelector('[data-widget="data-pipeline-quiz"]'), {
      id: "data-pipeline",
      chapterId: 19,
      title: "Data pipeline checkpoint",
      subtitle: "Windows, shifts, and leakage.",
      questions: [
        {
          prompt: "In causal LM training, the target at position $t$ is:",
          options: [
            "The input at position $t$",
            "The input at position $t+1$",
            "A random token",
            "The last token of the corpus"
          ],
          answer: 1,
          explanation: "The model predicts the next token, so the target is shifted one position."
        },
        {
          prompt: "A corpus of 9 tokens with $T=4$ and stride 4 yields how many full windows?",
          options: ["1", "2", "3", "4"],
          answer: 1,
          explanation: "The windows start at 0 and 4; each needs 5 tokens (4 input plus 1 target)."
        },
        {
          prompt: "Padding labels are usually set to -100 so that:",
          options: [
            "They are ignored by cross-entropy",
            "They become the largest logit",
            "They increase the learning rate",
            "They are treated as EOS"
          ],
          answer: 0,
          explanation: "The ignore-index prevents padding from contributing to the loss."
        },
        {
          prompt: "A leakage-safe validation split is made:",
          options: [
            "At the document level before tokenization",
            "After shuffling all tokens",
            "Using the training tokenizer on both splits",
            "By duplicating documents"
          ],
          answer: 0,
          explanation: "Splitting at the document level avoids near-duplicate text crossing the boundary."
        },
        {
          prompt: "The batch input shape after stacking windows is:",
          options: ["$(B,T)$", "$(T,T)$", "$(B,V)$", "$(T,V)$"],
          answer: 0,
          explanation: "Each window has $T$ tokens, and a batch stacks $B$ windows."
        }
      ]
    });

    MS.ui.bindChecklist(root, 19);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[19] = true;
})();
