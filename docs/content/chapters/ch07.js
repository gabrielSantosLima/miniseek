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
          <a href="#worked">Worked example</a>
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
          ${MS.ui.symbols([
            ["$p(x)$", "The probability mass assigned to outcome $x$."],
            ["$p(x)\\ge0$", "Probabilities cannot be negative."],
            ["$\\sum_x p(x)=1$", "The total probability over all outcomes is exactly one."]
          ])}
          <p>
            A language model defines a categorical distribution over the vocabulary
            at every position. The softmax is the standard way to parameterize that
            distribution from unconstrained logits:
          </p>
          <div class="formula">
            $$p_i=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$
          </div>
          ${MS.ui.symbols([
            ["$z_i$", "The logit for vocabulary item $i$; an unconstrained real number."],
            ["$e^{z_i}$", "The exponentiated logit, which is always positive."],
            ["$\\sum_j e^{z_j}$", "The normalizer over all $V$ vocabulary items."],
            ["$p_i$", "The resulting probability for item $i$; all $p_i$ sum to one."]
          ])}
          <p>
            The exponential makes the transformation positive and order-preserving:
            a larger logit always produces a larger probability. The normalizer is
            what makes the outputs a distribution. In practice, implementations
            subtract the maximum logit before exponentiating to avoid overflow; the
            result is mathematically identical.
          </p>
          <p>
            The categorical distribution generalizes the Bernoulli distribution from
            two outcomes to $V$ outcomes. Sampling from it means drawing one token
            according to its probability. Temperature divides the logits before the
            softmax: low temperature sharpens the distribution, high temperature
            flattens it.
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
          ${MS.ui.symbols([
            ["$P(A\\mid B)$", "The posterior: the probability of $A$ after observing $B$."],
            ["$P(B\\mid A)$", "The likelihood: how probable the observation is if $A$ is true."],
            ["$P(A)$", "The prior: the probability of $A$ before observing $B$."],
            ["$P(B)$", "The evidence or marginal probability of the observation."]
          ])}
          <p>
            Bayes' rule is a way to reverse a conditional probability. It is the
            foundation of Bayesian updating: start with a prior, observe evidence,
            and obtain a posterior. In machine learning it also explains why a
            model's predictions depend on both the data and the prior assumptions
            encoded by its architecture and regularization.
          </p>
          <p>
            The expectation of a function is its probability-weighted average:
          </p>
          <div class="formula">
            $$\\mathbb{E}_{x\\sim p}[f(x)]=\\sum_x p(x)f(x)$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbb{E}_{x\\sim p}$", "Expectation under the distribution $p$."],
            ["$f(x)$", "Any function of the random outcome, such as a loss or a reward."],
            ["$p(x)$", "The probability weight assigned to outcome $x$."],
            ["$\\sum_x$", "The weighted sum over all possible outcomes."]
          ])}
          <p>
            Variance measures spread:
            $\\operatorname{Var}(X)=\\mathbb{E}[(X-\\mathbb{E}[X])^2]$. In training,
            variance across examples and gradients is a major source of noise.
            Bias and variance together determine the expected squared error of an
            estimator. The bias–variance decomposition is the statistical version of
            the underfitting/overfitting trade-off you will meet in Chapter 10.
          </p>
          <p>
            Maximum likelihood estimation chooses parameters that make the observed
            data most probable. For a categorical model, the MLE is the empirical
            frequency of each outcome. In language modeling, the data are token
            sequences and the likelihood factorizes autoregressively. Maximizing the
            likelihood is equivalent to minimizing the negative log-likelihood,
            which becomes cross-entropy.
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
          ${MS.ui.symbols([
            ["$H(p)$", "The entropy of distribution $p$, measured in nats when the logarithm is natural."],
            ["$p(x)$", "The probability of outcome $x$."],
            ["$\\log$", "The natural logarithm in information theory; using base 2 would measure bits instead of nats."]
          ])}
          <p>
            Entropy is maximized by a uniform distribution and is zero for a
            deterministic one. It measures uncertainty, not the number of possible
            outcomes by itself: a distribution concentrated on one outcome has low
            entropy even if the vocabulary is huge.
          </p>
          <div class="formula">
            $$H(p,q)=-\\sum_x p(x)\\log q(x)$$
          </div>
          ${MS.ui.symbols([
            ["$H(p,q)$", "The cross-entropy: the average surprise of using model $q$ when the truth is $p$."],
            ["$p(x)$", "The true probability of outcome $x$."],
            ["$q(x)$", "The model's predicted probability of outcome $x$."]
          ])}
          <p>
            Cross-entropy is not symmetric: $H(p,q)\\ne H(q,p)$ in general. It
            penalizes the model heavily when it assigns a tiny probability to an
            outcome that actually occurs, because $-\\log q(x)$ becomes large.
          </p>
          <p>
            KL divergence measures the extra cost:
          </p>
          <div class="formula">
            $$D_{KL}(p\\|q)=\\sum_x p(x)\\log\\frac{p(x)}{q(x)}
              =H(p,q)-H(p)$$
          </div>
          ${MS.ui.symbols([
            ["$D_{KL}(p\\|q)$", "The Kullback–Leibler divergence from $p$ to $q$; a non-negative measure of mismatch."],
            ["$\\log\\frac{p(x)}{q(x)}$", "The log-ratio of true to predicted probability for outcome $x$."],
            ["$H(p,q)-H(p)$", "The extra cost of using $q$ instead of the true distribution $p$."]
          ])}
          <p>
            Since $H(p)$ does not depend on the model, minimizing cross-entropy is
            equivalent to minimizing KL divergence. This is why next-token language
            modeling uses cross-entropy loss over the vocabulary. KL divergence is
            not a true distance because it is not symmetric and does not satisfy the
            triangle inequality, but it is non-negative and zero exactly when
            $p=q$ almost everywhere.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">The training objective</p>
              <p>
                For a sequence $x_1,\\ldots,x_T$, the loss is
                $-\\sum_t\\log p_\\theta(x_t\\mid x_{&lt;t})$. In practice it is averaged
                over tokens and batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">7.4</span> Worked example: Bayes, softmax, and information</h2>
        <div class="prose">
          <p>
            These are three short calculations that use the chapter's core formulas.
            The probabilities are synthetic and chosen so that the arithmetic is easy
            to follow.
          </p>
        </div>

        <div class="worked-example">
          <h3>From a posterior to a cross-entropy</h3>
          <p class="example-intro">
            Work each part separately; the final review checks that the pieces agree.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Bayes' rule with a rare event</h4>
              <p>
                Suppose $P(D)=0.01$, $P(+\\mid D)=0.95$, and
                $P(+\\mid\\neg D)=0.05$. First compute the evidence:
              </p>
              <p>
                $$P(+)=0.95\\cdot0.01+0.05\\cdot0.99
                  =0.0095+0.0495=0.059.$$
                Then
              </p>
              <p>
                $$P(D\\mid+)=\\frac{0.95\\cdot0.01}{0.059}
                  =\\frac{0.0095}{0.059}\\approx0.1610.$$
                Despite the positive test, the posterior is about $16\\%$ because the
                prior is small.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Softmax of three logits</h4>
              <p>
                For $\\mathbf{z}=(2,1,0)$:
              </p>
              <p>
                $$e^2\\approx7.3891,\\quad e^1\\approx2.7183,\\quad e^0=1,$$
                $$\\sum_j e^{z_j}\\approx11.1073,$$
                $$\\mathbf{p}\\approx(0.6652,0.2447,0.0900).$$
                The three probabilities sum to $1$, and the largest logit receives
                the largest probability.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Cross-entropy for a one-hot target</h4>
              <p>
                If the correct class is the first one, the target is
                $\\mathbf{y}=(1,0,0)$. Then
              </p>
              <p>
                $$H(\\mathbf{y},\\mathbf{p})
                  =-1\\cdot\\log(0.6652)\\approx0.4076\\ \\text{nats}.$$
                Since the true distribution is deterministic, its entropy is $0$,
                so the KL divergence equals the cross-entropy.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Entropy, cross-entropy, and KL for general distributions</h4>
              <p>
                Let $p=(0.6,0.3,0.1)$ and $q=(0.7,0.2,0.1)$. Then
              </p>
              <p>
                $$H(p)=-(0.6\\log0.6+0.3\\log0.3+0.1\\log0.1)
                  \\approx0.8979,$$
                $$H(p,q)=-(0.6\\log0.7+0.3\\log0.2+0.1\\log0.1)
                  \\approx0.9271,$$
                $$D_{KL}(p\\|q)=H(p,q)-H(p)\\approx0.9271-0.8979=0.0291.$$
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the evidence $0.059$ is the sum of the two
            weighted likelihoods; the posterior $0.0095/0.059$ is about $0.1610$.
            The softmax values sum to $1$ and are ordered like the logits. For the
            one-hot target, KL equals cross-entropy because $H(p)=0$. For the general
            distributions, $H(p,q)-H(p)=0.0291$ matches the direct KL sum, and the
            non-negative result is consistent with Gibbs' inequality.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="labs">
        <h2 class="section-title"><span class="section-index">7.5</span> Labs</h2>
        <div data-widget="softmax-lab"></div>
        <div data-widget="cross-entropy-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">7.6</span> Check your understanding</h2>
        <div data-widget="probability-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">7.7</span> Mastery checklist
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
        <h2 class="section-title"><span class="section-index">7.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Deisenroth, Faisal & Ong, Mathematics for Machine Learning — Chapter 6", source: "Probability and distributions" },
          { title: "Stewart, Cálculo Vol. 1 — §8.5", source: "Probability as an application of integration; continuous distributions" },
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
