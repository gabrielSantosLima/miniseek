/* Chapter 7 — Probability, statistics, and information theory. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(7);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 7</div>
        <h1 class="chapter-title">Probability, Statistics, and Information Theory</h1>
        <p class="chapter-goal">
          Understand language modeling as a probability problem and the loss
          functions that follow from it.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">14 hours</span>
          <span class="meta-pill">MML Ch. 6</span>
          <span class="meta-pill">2 interactive labs</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#distributions">Distributions</a>
          <a href="#bayes">Bayes and expectation</a>
          <a href="#information">Information theory</a>
          <a href="#labs">Labs</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="distributions">
        <h2 class="section-title"><span class="section-index">7.1</span> Random variables and distributions</h2>
        <div class="prose">
          <p>
            A random variable maps outcomes to numbers. A discrete distribution
            assigns a probability to each value, with all probabilities non-negative
            and summing to one:
          </p>
          <div class="formula">
            $$p(x)\\ge 0,\\qquad\\sum_x p(x)=1$$
          </div>
          <p>
            A language model defines a categorical distribution over the vocabulary
            at every position. The softmax is the standard way to parameterize that
            distribution from unconstrained logits:
          </p>
          <div class="formula">
            $$p_i=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$
          </div>
          <p>
            The categorical distribution generalizes the Bernoulli distribution from
            two outcomes to $V$ outcomes. Sampling from it means drawing one token
            according to its probability.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="bayes">
        <h2 class="section-title"><span class="section-index">7.2</span> Bayes' rule and expectation</h2>
        <div class="prose">
          <p>
            Conditional probability leads directly to Bayes' rule:
          </p>
          <div class="formula">
            $$P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}$$
          </div>
          <p>
            The expectation of a function is its probability-weighted average:
          </p>
          <div class="formula">
            $$\\mathbb{E}_{x\\sim p}[f(x)]=\\sum_x p(x)f(x)$$
          </div>
          <p>
            Variance measures spread:
            $\\operatorname{Var}(X)=\\mathbb{E}[(X-\\mathbb{E}[X])^2]$. In training,
            variance across examples and gradients is a major source of noise.
          </p>
          <p>
            Maximum likelihood estimation chooses parameters that make the observed
            data most probable. For a categorical model, the MLE is the empirical
            frequency of each outcome. In language modeling, the data are token
            sequences and the likelihood factorizes autoregressively.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="information">
        <h2 class="section-title"><span class="section-index">7.3</span> Entropy, cross-entropy, and KL divergence</h2>
        <div class="prose">
          <p>
            Entropy measures the average surprise of a distribution:
          </p>
          <div class="formula">
            $$H(p)=-\\sum_x p(x)\\log p(x)$$
          </div>
          <p>
            Cross-entropy measures the cost of using $q$ when the truth is $p$:
          </p>
          <div class="formula">
            $$H(p,q)=-\\sum_x p(x)\\log q(x)$$
          </div>
          <p>
            KL divergence measures the extra cost:
          </p>
          <div class="formula">
            $$D_{KL}(p\\|q)=\\sum_x p(x)\\log\\frac{p(x)}{q(x)}
              =H(p,q)-H(p)$$
          </div>
          <p>
            Since $H(p)$ does not depend on the model, minimizing cross-entropy is
            equivalent to minimizing KL divergence. This is why next-token language
            modeling uses cross-entropy loss over the vocabulary.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">The training objective</p>
              <p>
                For a sequence $x_1,\\ldots,x_T$, the loss is
                $-\\sum_t\\log p_\\theta(x_t\\mid x_{<t})$. In practice it is averaged
                over tokens and batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">7.4</span> Labs</h2>
        <div data-widget="softmax-lab"></div>
        <div data-widget="cross-entropy-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">7.5</span> Check your understanding</h2>
        <div data-widget="probability-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">7.6</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(7, [
          "State Bayes' rule and apply it to a small example.",
          "Compute expectation and variance for a discrete distribution.",
          "Derive the softmax from the categorical likelihood.",
          "Derive cross-entropy from maximum likelihood.",
          "Explain the relationship between cross-entropy and KL divergence.",
          "Explain what temperature does to a token distribution."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">7.7</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Deisenroth, Faisal & Ong, Mathematics for Machine Learning — Chapter 6", source: "Probability and distributions" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 3", source: "Probability and information theory" },
          { title: "Nielsen, Neural Networks and Deep Learning — Chapter 3", source: "Optional: cross-entropy from a different angle" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(7)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.softmaxLab(root.querySelector('[data-widget="softmax-lab"]'));
    MS.widgets.crossEntropyLab(root.querySelector('[data-widget="cross-entropy-lab"]'));

    MS.createQuiz(root.querySelector('[data-widget="probability-quiz"]'), {
      id: "probability",
      chapterId: 7,
      title: "Probability checkpoint",
      subtitle: "Distributions, likelihood, and information.",
      questions: [
        {
          prompt: "The outputs of a softmax always:",
          options: [
            "Sum to one and are non-negative",
            "Sum to zero",
            "Are all equal",
            "Are integers"
          ],
          answer: 0,
          explanation: "Softmax exponentiates logits and divides by their sum, producing a valid categorical distribution."
        },
        {
          prompt: "For fixed $p$, cross-entropy $H(p,q)$ is minimized when:",
          options: ["$q$ is uniform", "$q=p$", "$q$ is one-hot on the wrong class", "$q$ has maximum entropy"],
          answer: 1,
          explanation: "Cross-entropy equals $H(p)$ when $q=p$; any mismatch adds KL divergence."
        },
        {
          prompt: "KL divergence $D_{KL}(p\\|q)$ is:",
          options: ["Always negative", "Always non-negative", "Always zero", "Symmetric"],
          answer: 1,
          explanation: "Gibbs' inequality gives $D_{KL}\\ge0$, with equality when $p=q$. It is not symmetric."
        },
        {
          prompt: "Raising the temperature of a softmax generally:",
          options: [
            "Makes the distribution sharper",
            "Makes the distribution more uniform",
            "Changes the argmax",
            "Removes the need for logits"
          ],
          answer: 1,
          explanation: "Dividing logits by a larger temperature flattens differences, moving the distribution toward uniform."
        },
        {
          prompt: "The negative log-likelihood of the correct token is:",
          options: [
            "$-\\log q_{\\text{correct}}$",
            "$\\log q_{\\text{correct}}$",
            "$1-q_{\\text{correct}}$",
            "$q_{\\text{correct}}^2$"
          ],
          answer: 0,
          explanation: "Minimizing negative log-likelihood is the same as maximizing the probability assigned to the correct token."
        }
      ]
    });

    MS.ui.bindChecklist(root, 7);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[7] = true;
})();
