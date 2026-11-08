/* Chapter 10 — Training neural networks. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(10);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part II — Neural Networks and Backpropagation <span class="dot"></span> Chapter 10</div>
        <h1 class="chapter-title">Training Neural Networks</h1>
        <p class="chapter-goal">
          Understand the optimization, initialization, normalization, and
          regularization choices that make deep networks trainable.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">18 hours</span>
          <span class="meta-pill">DLB Ch. 7–8</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#risk">Risk and generalization</a>
          <a href="#optimizers">Optimizers</a>
          <a href="#stability">Initialization and normalization</a>
          <a href="#regularization">Regularization</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="risk">
        <h2 class="section-title"><span class="section-index">10.1</span> Risk, splits, and generalization</h2>
        <div class="prose">
          <p>
            Training minimizes empirical risk on a finite sample:
          </p>
          <div class="formula">
            $$\\hat R(\\theta)=\\frac1N\\sum_{i=1}^{N}\\ell(f_\\theta(x_i),y_i)$$
          </div>
          ${MS.ui.symbols([
            ["$\\hat R(\\theta)$", "The empirical risk: average loss on the training sample."],
            ["$N$", "The number of training examples."],
            ["$f_\\theta(x_i)$", "The model prediction for example $i$."],
            ["$y_i$", "The target for example $i$."],
            ["$\\ell$", "The per-example loss, such as cross-entropy or squared error."]
          ])}
          <p>
            But the goal is low risk on unseen data. The training set, validation
            set, and test set exist to separate optimization from evaluation. The
            validation set guides choices; the test set is used once. Reusing the
            test set for decisions turns it into a validation set and destroys its
            ability to estimate generalization.
          </p>
          <p>
            <strong>Underfitting</strong> means the model is too simple or
            under-trained; both training and validation loss are high.
            <strong>Overfitting</strong> means training loss is low but validation
            loss rises. The gap is the signal. A third failure mode is a distribution
            shift: validation and test loss are both high even though the model fits
            the training distribution.
          </p>
          <p>
            The bias–variance decomposition writes expected squared error as
            bias$^2$ plus variance plus irreducible noise. More capacity usually
            lowers bias and raises variance; regularization and more data reduce
            variance. Modern over-parameterized networks complicate the classical
            picture, but the diagnostic logic remains useful.
          </p>
          <div class="callout note">
            <div class="callout-icon" aria-hidden="true">i</div>
            <div>
              <p class="callout-title">Bias–variance</p>
              <p>
                High bias is systematic error from an overly simple model. High
                variance is sensitivity to the particular training sample. More
                capacity usually lowers bias and raises variance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="optimizers">
        <h2 class="section-title"><span class="section-index">10.2</span> SGD, momentum, and Adam</h2>
        <div class="prose">
          <p>
            Mini-batch stochastic gradient descent estimates the gradient on a small
            sample and updates:
          </p>
          <div class="formula">
            $$\\theta_{k+1}=\\theta_k-\\eta\\,\\hat g_k$$
          </div>
          ${MS.ui.symbols([
            ["$\\theta_k$", "The parameter vector after $k$ updates."],
            ["$\\eta$", "The learning rate."],
            ["$\\hat g_k$", "The mini-batch gradient estimate at step $k$."],
            ["$\\theta_{k+1}$", "The updated parameters."]
          ])}
          <p>
            The mini-batch gradient is a noisy but unbiased estimate of the full
            gradient, provided the batch is sampled uniformly. The noise is not only
            a nuisance: it can help escape sharp minima and saddle points. The batch
            size controls the variance of the estimate and the hardware efficiency
            of the update.
          </p>
          <p>
            Momentum accumulates a velocity:
          </p>
          <div class="formula">
            $$v_{k+1}=\\beta v_k+\\hat g_k,\\qquad
              \\theta_{k+1}=\\theta_k-\\eta v_{k+1}$$
          </div>
          ${MS.ui.symbols([
            ["$v_k$", "The velocity: an exponentially weighted sum of past gradients."],
            ["$\\beta$", "The momentum coefficient, usually around $0.9$."],
            ["$\\hat g_k$", "The current mini-batch gradient."],
            ["$\\eta v_{k+1}$", "The actual parameter step after momentum is applied."]
          ])}
          <p>
            Momentum smooths erratic directions and accelerates consistent ones. It
            can overshoot near a minimum, especially with a large learning rate, but
            it often traverses long flat valleys much faster than plain SGD.
          </p>
          <p>
            Adam keeps a running mean and variance of the gradient:
          </p>
          <div class="formula">
            $$m_k=\\beta_1m_{k-1}+(1-\\beta_1)\\hat g_k,\\qquad
              v_k=\\beta_2v_{k-1}+(1-\\beta_2)\\hat g_k^2$$
          </div>
          ${MS.ui.symbols([
            ["$m_k$", "The first moment estimate: a running average of the gradient."],
            ["$v_k$", "The second moment estimate: a running average of squared gradients."],
            ["$\\beta_1$", "The decay rate for the first moment, usually $0.9$."],
            ["$\\beta_2$", "The decay rate for the second moment, usually $0.999$."],
            ["$\\hat g_k^2$", "The element-wise square of the current gradient."]
          ])}
          <div class="formula">
            $$\\hat m_k=\\frac{m_k}{1-\\beta_1^k},\\qquad
              \\hat v_k=\\frac{v_k}{1-\\beta_2^k},\\qquad
              \\theta_{k+1}=\\theta_k-\\eta\\frac{\\hat m_k}{\\sqrt{\\hat v_k}+\\epsilon}$$
          </div>
          ${MS.ui.symbols([
            ["$\\hat m_k$", "The bias-corrected first moment."],
            ["$\\hat v_k$", "The bias-corrected second moment."],
            ["$1-\\beta_1^k,\\ 1-\\beta_2^k$", "Correction factors that account for the zero initialization of the moments."],
            ["$\\epsilon$", "A tiny constant that prevents division by zero."],
            ["$\\eta\\hat m_k/(\\sqrt{\\hat v_k}+\\epsilon)$", "The adaptive step: large for consistently small gradients, small for large ones."]
          ])}
          <p>
            The bias correction matters in the first few steps, when the moment
            estimates start at zero. Adam is often a strong default, but SGD with
            momentum can generalize better in some settings. The choice is empirical,
            not universal.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="stability">
        <h2 class="section-title"><span class="section-index">10.3</span> Initialization and normalization</h2>
        <div class="prose">
          <p>
            Zero initialization of hidden layers makes all units compute the same
            function and receive the same gradient. They never differentiate.
            Symmetry must be broken by random initialization.
          </p>
          <p>
            Xavier/Glorot initialization preserves variance across layers for tanh
            and sigmoid networks. He initialization is adjusted for ReLU:
          </p>
          <div class="formula">
            $$W_{ij}\\sim\\mathcal N\\left(0,\\frac{2}{n_{\\text{in}}}\\right)
              \\quad\\text{(He)}$$
          </div>
          ${MS.ui.symbols([
            ["$W_{ij}$", "A single weight in the layer."],
            ["$\\mathcal N(0,\\sigma^2)$", "A normal distribution with mean zero and variance $\\sigma^2$."],
            ["$n_{\\text{in}}$", "The number of input features to the layer (fan-in)."],
            ["$2/n_{\\text{in}}$", "The He variance, chosen to preserve activation variance through ReLU layers."]
          ])}
          <p>
            Xavier/Glorot initialization uses a variance that balances fan-in and
            fan-out, $2/(n_{\\text{in}}+n_{\\text{out}})$, which suits tanh and
            sigmoid networks. He initialization replaces the numerator with $2$ to
            compensate for ReLU zeroing half of its inputs. The goal in both cases is
            to keep the variance of activations and gradients roughly constant across
            layers, avoiding exponential decay or growth at initialization.
          </p>
          <p>
            Normalization stabilizes activation distributions:
          </p>
          <ul>
            <li><strong>Batch normalization</strong> normalizes over the batch dimension and behaves differently in training and inference.</li>
            <li><strong>Layer normalization</strong> normalizes over the feature dimension of each example and is standard in Transformers.</li>
          </ul>
          <p>
            Both compute a mean and variance and then apply a learned scale and
            shift. Batch norm couples examples in a batch, which is awkward for
            variable-length sequences; layer norm treats each example independently,
            which is why it dominates in language models. Pre-norm residual blocks
            place normalization before the sublayer, while post-norm places it after;
            pre-norm is generally easier to optimize at depth.
          </p>
          <p>
            Learning-rate schedules matter too. Warmup avoids large early updates;
            cosine or step decay reduces the rate as training stabilizes. A schedule
            is a bet about non-stationarity: early training needs exploration, late
            training needs fine adjustment.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="regularization">
        <h2 class="section-title"><span class="section-index">10.4</span> Regularization and debugging</h2>
        <div class="prose">
          <p>
            Regularization trades training fit for generalization:
          </p>
          <ul>
            <li><strong>Weight decay</strong> penalizes large parameters.</li>
            <li><strong>Dropout</strong> randomly zeroes activations during training.</li>
            <li><strong>Early stopping</strong> stops when validation loss stops improving.</li>
            <li><strong>Label smoothing</strong> softens one-hot targets.</li>
          </ul>
          <div class="formula">
            $$L_{\\text{reg}}(\\theta)=L(\\theta)+\\lambda\\lVert\\theta\\rVert_2^2$$
          </div>
          ${MS.ui.symbols([
            ["$L_{\\text{reg}}$", "The regularized training objective."],
            ["$L(\\theta)$", "The original data loss, such as cross-entropy."],
            ["$\\lambda$", "The regularization strength; larger values penalize large weights more."],
            ["$\\lVert\\theta\\rVert_2^2$", "The sum of squared parameter values, which discourages large weights."]
          ])}
          <p>
            Weight decay is equivalent to a Gaussian prior on the parameters in a
            Bayesian view. Dropout can be understood as training an ensemble of
            thinned networks and averaging at inference time. Early stopping is a
            form of implicit regularization: it limits how far the parameters travel
            from initialization. Label smoothing prevents the model from becoming
            overconfident in one-hot targets.
          </p>
          <p>
            Debugging is mostly diagnosis: a loss that does not move suggests a
            broken gradient or zero learning rate; a loss that explodes suggests too
            large a rate; a widening train/validation gap suggests overfitting;
            dead ReLUs suggest a saturated or badly initialized network.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">One change at a time</p>
              <p>
                A training run is an experiment. Change one variable, record the
                result, and keep a reproducible configuration.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">10.5</span> Lab</h2>
        <div data-widget="optimizer-race"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">10.6</span> Check your understanding</h2>
        <div data-widget="training-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">10.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(10, [
          "Explain the difference between batch, stochastic, and mini-batch gradient descent.",
          "Write the Adam update equations.",
          "Explain why zero initialization fails in a deep network.",
          "Explain the difference between batch norm and layer norm.",
          "Choose a regularization strategy for a given failure mode.",
          "Diagnose underfitting vs overfitting from learning curves."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">10.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapters 7–8", source: "Regularization, optimization, and training" },
          { title: "Kingma & Ba (2014), Adam", source: "The original Adam paper" },
          { title: "Ba, Kiros & Hinton (2016), Layer Normalization", source: "Layer normalization" },
          { title: "Ioffe & Szegedy (2015), Batch Normalization", source: "Batch normalization" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(10)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.optimizerRace(root.querySelector('[data-widget="optimizer-race"]'));

    MS.createQuiz(root.querySelector('[data-widget="training-quiz"]'), {
      id: "training",
      chapterId: 10,
      title: "Training checkpoint",
      subtitle: "Optimization and generalization.",
      questions: [
        {
          prompt: "Adam maintains running estimates of:",
          options: [
            "Only the gradient",
            "The first and second moments of the gradient",
            "The weights only",
            "The learning rate only"
          ],
          answer: 1,
          explanation: "Adam tracks a mean and an uncentered variance of the gradient, with bias correction."
        },
        {
          prompt: "Why is zero initialization problematic for hidden layers?",
          options: [
            "It makes the loss negative",
            "All hidden units remain symmetric and learn the same features",
            "It disables the optimizer",
            "It changes the input shape"
          ],
          answer: 1,
          explanation: "Identical units receive identical gradients, so symmetry is never broken."
        },
        {
          prompt: "Layer normalization normalizes:",
          options: [
            "Across the batch for each feature",
            "Across the features of each example",
            "The learning rate",
            "The output vocabulary"
          ],
          answer: 1,
          explanation: "Layer norm operates within each example, which is convenient for variable batch sizes and sequence models."
        },
        {
          prompt: "A widening gap between training and validation loss suggests:",
          options: ["Underfitting", "Overfitting", "A broken compiler", "A zero gradient"],
          answer: 1,
          explanation: "The model is fitting the training set better than it generalizes."
        },
        {
          prompt: "Weight decay is a form of:",
          options: ["Data augmentation", "Regularization", "Normalization", "Tokenization"],
          answer: 1,
          explanation: "Penalizing large weights discourages overly complex fits and is a standard regularizer."
        }
      ]
    });

    MS.ui.bindChecklist(root, 10);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[10] = true;
})();
