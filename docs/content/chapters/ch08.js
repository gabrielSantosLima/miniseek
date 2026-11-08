/* Chapter 8 — From linear models to neural networks. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(8);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part II — Neural Networks and Backpropagation <span class="dot"></span> Chapter 8</div>
        <h1 class="chapter-title">From Linear Models to Neural Networks</h1>
        <p class="chapter-goal">
          Build the simplest models that learn, then see exactly what a
          nonlinearity adds.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">12 hours</span>
          <span class="meta-pill">DLB Ch. 4–5</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#linear">Linear and logistic models</a>
          <a href="#mlp">Multilayer perceptrons</a>
          <a href="#perceptron">Perceptron example</a>
          <a href="#universal">Universal approximation</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="linear">
        <h2 class="section-title"><span class="section-index">8.1</span> Linear and logistic models</h2>
        <div class="prose">
          <p>
            Linear regression predicts a scalar as an affine function of the input:
          </p>
          <div class="formula">
            $$\\hat{y}=w^Tx+b$$
            <div class="formula-caption">The mean-squared error is $\\frac1N\\sum_i(\\hat y_i-y_i)^2$.</div>
          </div>
          ${MS.ui.symbols([
            ["$\\hat{y}$", "The model's prediction for one example."],
            ["$w$", "The weight vector: one coefficient per input feature."],
            ["$x$", "The input feature vector."],
            ["$b$", "The bias: a learned offset independent of the input."],
            ["$w^Tx$", "The dot product of weights and features — the linear score."]
          ])}
          <p>
            The model is linear in its parameters, not necessarily in its inputs:
            you can feed transformed features $\\phi(x)$ and still use a linear
            model. The mean-squared error is the maximum-likelihood objective under
            a Gaussian noise assumption. Its gradient with respect to $w$ is
            proportional to the prediction error, which is why the update has the
            familiar form “move in the direction that reduces the residual.”
          </p>
          <p>
            Logistic regression passes the same score through a sigmoid to produce a
            probability:
          </p>
          <div class="formula">
            $$\\hat{p}=\\sigma(w^Tx+b),\\qquad
              \\sigma(z)=\\frac{1}{1+e^{-z}}$$
          </div>
          ${MS.ui.symbols([
            ["$\\hat{p}$", "The predicted probability of the positive class."],
            ["$\\sigma$", "The logistic sigmoid, mapping any real score to $(0,1)$."],
            ["$z=w^Tx+b$", "The log-odds or logit: the linear score before the sigmoid."],
            ["$e^{-z}$", "The exponential that makes the sigmoid saturate at both ends."]
          ])}
          <p>
            Training minimizes binary cross-entropy,
            $-\\sum_i y_i\\log\\hat p_i+(1-y_i)\\log(1-\\hat p_i)$.
            The model is still linear in its parameters, so its decision boundary is
            a hyperplane. The gradient with respect to the logit is $\\hat p-y$,
            the same clean error signal that appears in softmax regression.
          </p>
          <p>
            The perceptron is the historical precursor: a linear threshold unit. It
            can separate linearly separable data, but it cannot represent XOR or any
            other non-linear boundary. The perceptron learning rule updates weights
            only when a point is misclassified, which is enough for linear
            separability but not for general classification.
          </p>
          <div class="callout warn">
            <div class="callout-icon" aria-hidden="true">!</div>
            <div>
              <p class="callout-title">The XOR limitation</p>
              <p>
                No single straight line separates the four XOR points. The fix is
                not a better optimizer; it is a representation with a hidden layer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="mlp">
        <h2 class="section-title"><span class="section-index">8.2</span> Multilayer perceptrons</h2>
        <div class="prose">
          <p>
            A multilayer perceptron (MLP) stacks affine maps and nonlinear
            activations:
          </p>
          <div class="formula">
            $$\\mathbf{h}=\\phi(W_1\\mathbf{x}+\\mathbf{b}_1),\\qquad
              \\hat{\\mathbf{y}}=W_2\\mathbf{h}+\\mathbf{b}_2$$
          </div>
          ${MS.ui.symbols([
            ["$\\mathbf{x}$", "The input vector."],
            ["$W_1,\\mathbf{b}_1$", "Weights and bias of the hidden layer."],
            ["$\\mathbf{h}$", "The hidden representation: learned features after the nonlinearity."],
            ["$\\phi$", "The activation function, applied element-wise."],
            ["$W_2,\\mathbf{b}_2$", "Weights and bias of the output layer."],
            ["$\\hat{\\mathbf{y}}$", "The output prediction or logits."]
          ])}
          <p>
            The activation $\\phi$ is applied element-wise. Common choices:
          </p>
          <ul>
            <li><strong>Sigmoid:</strong> bounded, smooth, but saturating. Its derivative is at most $1/4$, so deep stacks lose signal quickly.</li>
            <li><strong>Tanh:</strong> zero-centred and smooth, still saturating. It often trains better than sigmoid in hidden layers.</li>
            <li><strong>ReLU:</strong> cheap, non-saturating for positive inputs, but has a dead zone. It is the default for many feed-forward networks.</li>
            <li><strong>GELU / Swish:</strong> smooth, non-monotonic, common in Transformers. They avoid a hard zero region and have well-behaved gradients.</li>
          </ul>
          <p>
            Without nonlinearities, a composition of affine maps is still affine:
            $W_2(W_1x+b_1)+b_2=(W_2W_1)x+(W_2b_1+b_2)$. Depth without
            nonlinearity adds no representational power. This is the single most
            important algebraic fact behind deep learning: depth matters only when
            it is interleaved with nonlinearities.
          </p>
          <p>
            With nonlinearities, hidden units act as learned features. The output
            layer combines those features linearly, which is why the final layer of
            a language model is often just a linear projection to vocabulary logits.
            Each hidden unit defines a ridge or a region in input space; composing
            many of them lets the network approximate complex boundaries.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="perceptron">
        <h2 class="section-title"><span class="section-index">8.3</span> Worked example: training a perceptron</h2>
        <div class="prose">
          <p>
            This is a small synthetic example, chosen so that every arithmetic step
            is exact. It is not a benchmark; the goal is to see how a weight update is
            computed before we replace the step function with a differentiable
            activation.
          </p>
          <p>
            A perceptron computes a linear score and applies a threshold:
          </p>
          <div class="formula">
            $$z=w_1x_1+w_2x_2+b,\qquad
              \\hat y=\\begin{cases}1,&z\\ge0\\\\0,&z&lt;0\\end{cases}$$
          </div>
          ${MS.ui.symbols([
            ["$x_1,x_2$", "The two input features of one example."],
            ["$w_1,w_2$", "The learnable weights."],
            ["$b$", "The bias, which shifts the decision boundary."],
            ["$z$", "The linear score before thresholding."],
            ["$\\hat y$", "The predicted class: $1$ if the score is non-negative, otherwise $0$."]
          ])}
          <p>
            The perceptron learning rule updates only when the prediction is wrong:
          </p>
          <div class="formula">
            $$w_j\\leftarrow w_j+\\eta\\,(y-\\hat y)\\,x_j,\\qquad
              b\\leftarrow b+\\eta\\,(y-\\hat y)$$
          </div>
          ${MS.ui.symbols([
            ["$\\eta$", "The learning rate; here $\\eta=0.1$."],
            ["$y$", "The true label, either $0$ or $1$."],
            ["$\\hat y$", "The predicted label."],
            ["$(y-\\hat y)$", "The error. It is $0$ when the prediction is correct, $+1$ for a false negative, and $-1$ for a false positive."],
            ["$x_j$", "The feature multiplying weight $w_j$; the update is proportional to the input."]
          ])}
          <p>
            The four training examples are:
          </p>
          <table>
            <thead><tr><th>Example</th><th>$x_1$</th><th>$x_2$</th><th>Label $y$</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>1</td><td>1</td><td>1</td></tr>
              <tr><td>2</td><td>2</td><td>1</td><td>1</td></tr>
              <tr><td>3</td><td>−1</td><td>−1</td><td>0</td></tr>
              <tr><td>4</td><td>−2</td><td>−1</td><td>0</td></tr>
            </tbody>
          </table>
        </div>

        <div class="worked-example">
          <h3>Step-by-step training</h3>
          <p class="example-intro">
            Initialize $w_1=0$, $w_2=0$, $b=0$, and use $\\eta=0.1$. Process the
            examples in the order shown.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Epoch 1, example 1: $(1,1)$, label $1$</h4>
              <p>
                $$z=0\\cdot1+0\\cdot1+0=0,\\qquad \\hat y=1.$$
                The prediction is correct, so the error is $y-\\hat y=0$ and no
                weight changes.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Epoch 1, example 2: $(2,1)$, label $1$</h4>
              <p>
                $$z=0\\cdot2+0\\cdot1+0=0,\\qquad \\hat y=1.$$
                Correct again; no update.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Epoch 1, example 3: $(-1,-1)$, label $0$</h4>
              <p>
                $$z=0\\cdot(-1)+0\\cdot(-1)+0=0,\\qquad \\hat y=1.$$
                The true label is $0$, so this is a false positive. The error is
                $y-\\hat y=0-1=-1$. Apply the rule:
              </p>
              <p>
                $$w_1\\leftarrow0+0.1\\cdot(-1)\\cdot(-1)=0.1,$$
                $$w_2\\leftarrow0+0.1\\cdot(-1)\\cdot(-1)=0.1,$$
                $$b\\leftarrow0+0.1\\cdot(-1)=-0.1.$$
                The weights now point in the direction that makes negative inputs
                score lower.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Epoch 1, example 4: $(-2,-1)$, label $0$</h4>
              <p>
                $$z=0.1\\cdot(-2)+0.1\\cdot(-1)-0.1=-0.4,\\qquad \\hat y=0.$$
                Correct; no update.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">5</span>
            <div>
              <h4>Epoch 2: verify all four examples</h4>
              <p>
                With $w=(0.1,0.1)$ and $b=-0.1$:
              </p>
              <table>
                <thead><tr><th>Example</th><th>Score $z$</th><th>$\\hat y$</th><th>Correct?</th></tr></thead>
                <tbody>
                  <tr><td>$(1,1)$</td><td>$0.1+0.1-0.1=0.1$</td><td>1</td><td>yes</td></tr>
                  <tr><td>$(2,1)$</td><td>$0.2+0.1-0.1=0.2$</td><td>1</td><td>yes</td></tr>
                  <tr><td>$(-1,-1)$</td><td>$-0.1-0.1-0.1=-0.3$</td><td>0</td><td>yes</td></tr>
                  <tr><td>$(-2,-1)$</td><td>$-0.2-0.1-0.1=-0.4$</td><td>0</td><td>yes</td></tr>
                </tbody>
              </table>
              <p>
                No example is misclassified, so training stops. The decision boundary
                is $0.1x_1+0.1x_2-0.1=0$, equivalently $x_1+x_2=1$.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> the update at example 3 uses error $-1$, so both
            weights increase by $0.1\\cdot1=0.1$ and the bias decreases by $0.1$.
            Substituting $w=(0.1,0.1)$ and $b=-0.1$ into all four scores reproduces
            the correct labels. The perceptron convergence theorem guarantees this
            finite stopping only because the data is linearly separable; with
            overlapping classes the rule can oscillate forever.
          </div>
        </div>

        <div class="prose">
          <p>
            The perceptron has no gradient because its step activation is not
            differentiable. Backpropagation replaces the step with a differentiable
            activation and uses the chain rule to assign credit to every weight. The
            update rule itself is the ancestor of gradient descent: both move weights
            in a direction that reduces the error, but the perceptron uses the raw
            label error while backpropagation uses a local derivative.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="universal">
        <h2 class="section-title"><span class="section-index">8.4</span> Universal approximation</h2>
        <div class="prose">
          <p>
            The universal approximation theorem states that a feed-forward network
            with at least one hidden layer and a suitable nonlinearity can approximate
            any continuous function on a compact domain to arbitrary accuracy,
            provided enough hidden units.
          </p>
          <p>
            What it does <em>not</em> guarantee:
          </p>
          <ul>
            <li>that gradient descent will find the required weights,</li>
            <li>that the network will generalize from finite data,</li>
            <li>that the required number of units is practical,</li>
            <li>that the approximation is stable or interpretable.</li>
          </ul>
          <p>
            This is the central distinction between <strong>representational
            capacity</strong> and <strong>learnability</strong>. The theorem is about
            the former; training is about the latter.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">8.5</span> Lab</h2>
        <div data-widget="mlp-fit"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">8.6</span> Check your understanding</h2>
        <div data-widget="nn-foundations-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">8.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(8, [
          "Derive the gradient of MSE for linear regression.",
          "Derive logistic regression's cross-entropy gradient.",
          "Explain why a linear model cannot solve XOR.",
          "State the universal approximation theorem and its limitations.",
          "Choose an activation function and justify the choice."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">8.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapters 4–5", source: "Linear models, MLPs, activations, and capacity" },
          { title: "Nielsen, Neural Networks and Deep Learning — Chapters 1–2", source: "A gentle derivation of perceptrons and sigmoid networks" },
          { title: "Deisenroth, Faisal & Ong, Mathematics for Machine Learning — Chapter 5", source: "Linear regression and classification" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(8)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.mlpFit(root.querySelector('[data-widget="mlp-fit"]'));

    MS.createQuiz(root.querySelector('[data-widget="nn-foundations-quiz"]'), {
      id: "nn-foundations",
      chapterId: 8,
      title: "Neural network foundations",
      subtitle: "Representation, nonlinearity, and loss.",
      questions: [
        {
          prompt: "Why does a deep network need nonlinear activation functions?",
          options: [
            "Without them, the composition collapses to a single affine map",
            "They make the network slower",
            "They remove the need for gradients",
            "They guarantee generalization"
          ],
          answer: 0,
          explanation: "A composition of affine maps is affine, so depth without nonlinearity has the same representational power as one layer."
        },
        {
          prompt: "Why can a single linear classifier not solve XOR?",
          options: [
            "The data is too large",
            "No straight line separates the classes",
            "The sigmoid is undefined",
            "The learning rate is too small"
          ],
          answer: 1,
          explanation: "XOR is not linearly separable; a hidden layer is needed to create a nonlinear decision boundary."
        },
        {
          prompt: "The universal approximation theorem guarantees:",
          options: [
            "That training will converge",
            "That a wide enough network can represent a continuous function",
            "That the model will generalize",
            "That no data is needed"
          ],
          answer: 1,
          explanation: "It is a statement about representational capacity, not about optimization or generalization."
        },
        {
          prompt: "For $\\hat y=wx+b$ and MSE, $\\partial L/\\partial w$ is proportional to:",
          options: ["$x$", "$(\\hat y-y)x$", "$\\hat y+y$", "$w^2$"],
          answer: 1,
          explanation: "The gradient of squared error with respect to $w$ is $2(\\hat y-y)x$ before averaging."
        },
        {
          prompt: "The output of logistic regression is:",
          options: [
            "An unbounded score",
            "A probability in $(0,1)$",
            "A token ID",
            "A matrix"
          ],
          answer: 1,
          explanation: "The sigmoid maps the linear score to the interval $(0,1)$, which can be interpreted as a probability."
        }
      ]
    });

    MS.ui.bindChecklist(root, 8);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[8] = true;
})();
