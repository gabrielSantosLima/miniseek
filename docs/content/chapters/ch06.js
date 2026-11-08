/* Chapter 6 — Linear algebra. */
(function () {
  "use strict";

  window.MiniSeek = window.MiniSeek || {};
  const MS = window.MiniSeek;
  const chapter = MS.getChapter(6);

  chapter.render = function () {
    return `
      <header class="chapter-header">
        <div class="chapter-kicker">Part I — Mathematical Foundations <span class="dot"></span> Chapter 6</div>
        <h1 class="chapter-title">Linear Algebra for Neural Networks</h1>
        <p class="chapter-goal">
          Become fluent in the matrix and tensor operations that define layers,
          embeddings, and attention.
        </p>
        <div class="chapter-meta">
          <span class="meta-pill">16 hours</span>
          <span class="meta-pill">MML Ch. 2–4 + Stewart Vol. 2 Ch. 12</span>
          <span class="meta-pill">1 interactive lab</span>
        </div>
        <nav class="chapter-toc" aria-label="In this chapter">
          <a href="#vectors">Vectors and matrices</a>
          <a href="#products">Matrix products</a>
          <a href="#structure">Rank, eigen, SVD</a>
          <a href="#worked">Worked example</a>
          <a href="#lab">Lab</a>
          <a href="#check">Check your understanding</a>
        </nav>
      </header>

      <section class="chapter-section" id="vectors">
        <h2 class="section-title"><span class="section-index">6.1</span> Vectors and matrices</h2>
        <div class="prose">
          <p>
            A vector is an ordered list of numbers; a matrix is a rectangular array.
            In this course, vectors are columns and a matrix acts on a vector as a
            linear map:
          </p>
          <div class="formula">
            $$\\mathbf{y}=W\\mathbf{x},\\qquad
              W\\in\\mathbb{R}^{m\\times n},\\quad
              \\mathbf{x}\\in\\mathbb{R}^{n},\\quad
              \\mathbf{y}\\in\\mathbb{R}^{m}$$
          </div>
          ${MS.ui.symbols([
            ["$W$", "An $m\\times n$ matrix representing a linear map from $n$ dimensions to $m$ dimensions."],
            ["$\\mathbf{x}$", "The input vector with $n$ components."],
            ["$\\mathbf{y}$", "The output vector with $m$ components."],
            ["$\\mathbb{R}^{m\\times n}$", "The set of real matrices with $m$ rows and $n$ columns."]
          ])}
          <p>
            A linear map satisfies two properties: $W(\\mathbf{x}+\\mathbf{z})=W\\mathbf{x}+W\\mathbf{z}$
            and $W(c\\mathbf{x})=cW\\mathbf{x}$. It preserves the origin and sends
            straight lines to straight lines. An affine map adds a bias and is
            therefore not linear in the strict sense, but it is the basic building
            block of a neural layer.
          </p>
          <p>
            The dot product measures alignment:
            $\\mathbf{x}\\cdot\\mathbf{y}=\\sum_i x_i y_i
              =\\lVert\\mathbf{x}\\rVert\\lVert\\mathbf{y}\\rVert\\cos\\theta$.
            It is zero for orthogonal vectors. In geometric terms, the dot product
            is the length of the projection of one vector onto the other, multiplied
            by the other length.
          </p>
          ${MS.ui.symbols([
            ["$\\mathbf{x}\\cdot\\mathbf{y}$", "The scalar dot product of two vectors of the same dimension."],
            ["$\\lVert\\mathbf{x}\\rVert$", "The Euclidean length of $\\mathbf{x}$."],
            ["$\\theta$", "The angle between the two vectors."],
            ["$\\cos\\theta$", "Positive for acute angles, zero for orthogonal vectors, negative for obtuse angles."]
          ])}
          <p>
            Norms measure size. The $L_2$ norm is
            $\\lVert\\mathbf{x}\\rVert_2=\\sqrt{\\sum_i x_i^2}$; the $L_1$ norm is the
            sum of absolute values. Regularization often penalizes a norm. The $L_2$
            penalty shrinks parameters smoothly, while the $L_1$ penalty encourages
            exact zeros and therefore sparsity.
          </p>
          <p>
            A matrix can be read in two equivalent ways: as a collection of columns,
            or as a collection of rows. Matrix multiplication combines both views:
            each output entry is a dot product of a row of the left matrix with a
            column of the right matrix. The column view is often more useful for
            understanding transformations; the row view is more useful for
            computing.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="products">
        <h2 class="section-title"><span class="section-index">6.2</span> Matrix products and shapes</h2>
        <div class="prose">
          <p>
            If $A\\in\\mathbb{R}^{m\\times k}$ and $B\\in\\mathbb{R}^{k\\times n}$,
            then $AB\\in\\mathbb{R}^{m\\times n}$. The inner dimensions must match:
          </p>
          <div class="formula">
            $$(m\\times k)(k\\times n)\\longrightarrow(m\\times n)$$
          </div>
          ${MS.ui.symbols([
            ["$m$", "Rows of the left matrix and rows of the result."],
            ["$k$", "Shared inner dimension: columns of the left matrix and rows of the right matrix."],
            ["$n$", "Columns of the right matrix and columns of the result."],
            ["$\\longrightarrow$", "Shape compatibility: the inner dimensions must match exactly."]
          ])}
          <p>
            Matrix multiplication is associative but not commutative:
            $AB\\ne BA$ in general. This is one reason layer order matters. It is
            also why a linear layer and its transpose have different shapes and
            different meanings: one maps forward, the other maps gradients
            backward.
          </p>
          <p>
            The transpose swaps rows and columns: $(AB)^T=B^TA^T$. In
            backpropagation, transposes are everywhere because a VJP multiplies by
            the Jacobian transpose. A useful shape rule is that the transpose of an
            $m\\times n$ matrix is $n\\times m$, so the product $W^T\\delta$ is
            dimensionally valid whenever $W$ maps the input to the output.
          </p>
          <p>
            An affine layer adds a bias after the matrix product:
            $\\mathbf{y}=W\\mathbf{x}+\\mathbf{b}$. The bias shifts the entire
            hyperplane and is essential: without it, every layer would map the origin
            to the origin. The bias also gives the model the ability to represent
            functions whose decision boundary does not pass through zero.
          </p>
          <div class="callout key">
            <div class="callout-icon" aria-hidden="true">◆</div>
            <div>
              <p class="callout-title">Shape discipline</p>
              <p>
                Most implementation bugs are shape bugs. Before multiplying, write
                down the shape of every operand; after multiplying, write down the
                result shape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="chapter-section" id="structure">
        <h2 class="section-title"><span class="section-index">6.3</span> Rank, eigenvalues, and SVD</h2>
        <div class="prose">
          <p>
            The <strong>rank</strong> of a matrix is the dimension of its column
            space. A square matrix is invertible exactly when its rank equals its
            size. The determinant is zero exactly when the matrix is singular and
            collapses space.
          </p>
          <p>
            An eigenvector $\\mathbf{v}$ of $A$ satisfies:
          </p>
          <div class="formula">
            $$A\\mathbf{v}=\\lambda\\mathbf{v}$$
            <div class="formula-caption">The matrix only scales the eigenvector; it does not rotate it.</div>
          </div>
          ${MS.ui.symbols([
            ["$A$", "A square matrix representing a linear transformation."],
            ["$\\mathbf{v}$", "A non-zero eigenvector: a direction that the matrix does not rotate."],
            ["$\\lambda$", "The eigenvalue: the factor by which the eigenvector is scaled. It can be negative or complex."]
          ])}
          <p>
            Eigenvalues reveal stability and curvature. A positive-definite matrix
            has all positive eigenvalues; it curves upward in every direction. A
            negative-definite matrix curves downward everywhere. An indefinite
            matrix has eigenvalues of both signs and produces a saddle. This is the
            linear-algebraic version of the second-derivative test.
          </p>
          <p>
            A matrix with a zero eigenvalue is singular: some non-zero direction is
            mapped to zero, so information is lost and the matrix has no inverse.
            This is the same phenomenon as a zero determinant.
          </p>
          <p>
            The singular value decomposition writes any matrix as:
          </p>
          <div class="formula">
            $$A=U\\Sigma V^T$$
          </div>
          ${MS.ui.symbols([
            ["$A$", "Any real $m\\times n$ matrix, including non-square and non-invertible matrices."],
            ["$U$", "An $m\\times m$ orthogonal matrix whose columns are the left singular vectors."],
            ["$\\Sigma$", "An $m\\times n$ diagonal matrix of non-negative singular values, sorted by size."],
            ["$V^T$", "The transpose of an $n\\times n$ orthogonal matrix whose columns are the right singular vectors."]
          ])}
          <p>
            $U$ and $V$ are orthogonal and $\\Sigma$ is diagonal with non-negative
            singular values. The SVD separates rotation, scaling, and another
            rotation. Truncating the smallest singular values gives the best
            low-rank approximation, which is why it appears in compression and in
            analyzing representation geometry. It also explains why a matrix can be
            full-rank in theory but numerically low-rank in practice: many singular
            values may be tiny.
          </p>
        </div>
      </section>

      <section class="chapter-section" id="worked">
        <h2 class="section-title"><span class="section-index">6.4</span> Worked example: products, determinant, and eigen</h2>
        <div class="prose">
          <p>
            This example uses a symmetric $2\\times2$ matrix so that every operation
            can be checked by hand. Write each intermediate matrix before moving to
            the next step.
          </p>
        </div>

        <div class="worked-example">
          <h3>One matrix, five calculations</h3>
          <p class="example-intro">
            Let $A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$,
            $B=\\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}$, and
            $\\mathbf{x}=(1,2)$.
          </p>

          <div class="example-step">
            <span class="step-number">1</span>
            <div>
              <h4>Matrix–vector product</h4>
              <p>
                $$A\\mathbf{x}
                  =\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}
                   \\begin{bmatrix}1\\\\2\\end{bmatrix}
                  =\\begin{bmatrix}2\\cdot1+1\\cdot2\\\\
                    1\\cdot1+2\\cdot2\\end{bmatrix}
                  =\\begin{bmatrix}4\\\\5\\end{bmatrix}.$$
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">2</span>
            <div>
              <h4>Two matrix products, in both orders</h4>
              <p>
                $$AB=
                  \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}
                  \\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}
                  =\\begin{bmatrix}4&1\\\\5&2\\end{bmatrix},$$
                $$BA=
                  \\begin{bmatrix}1&0\\\\2&1\\end{bmatrix}
                  \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}
                  =\\begin{bmatrix}2&1\\\\5&4\\end{bmatrix}.$$
                Since $AB\\ne BA$, matrix multiplication is not commutative.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">3</span>
            <div>
              <h4>Determinant and inverse</h4>
              <p>
                $$\\det A=2\\cdot2-1\\cdot1=3.$$
                For a $2\\times2$ matrix
                $\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$, the inverse is
                $\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$, so
              </p>
              <p>
                $$A^{-1}=\\frac13\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}.$$
                Check: $A A^{-1}=I$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">4</span>
            <div>
              <h4>Eigenvalues</h4>
              <p>
                For a $2\\times2$ matrix, the characteristic polynomial is
                $\\lambda^2-(\\operatorname{tr}A)\\lambda+\\det A=0$. Here
                $\\operatorname{tr}A=4$ and $\\det A=3$, so
              </p>
              <p>
                $$\\lambda^2-4\\lambda+3=(\\lambda-3)(\\lambda-1)=0,$$
                giving $\\lambda_1=3$ and $\\lambda_2=1$.
              </p>
            </div>
          </div>

          <div class="example-step">
            <span class="step-number">5</span>
            <div>
              <h4>Eigenvectors</h4>
              <p>
                For $\\lambda=3$, solve $(A-3I)\\mathbf{v}=0$:
                $\\begin{bmatrix}-1&1\\\\1&-1\\end{bmatrix}\\mathbf{v}=0$,
                so $\\mathbf{v}_1=(1,1)$.
                For $\\lambda=1$, $(A-I)\\mathbf{v}=0$ gives
                $\\mathbf{v}_2=(1,-1)$.
              </p>
              <p>
                Check: $A(1,1)=(3,3)=3(1,1)$ and
                $A(1,-1)=(1,-1)=1(1,-1)$.
                Because $A$ is symmetric positive definite, its singular values are
                $3$ and $1$, and the eigenvectors are also the singular directions.
              </p>
            </div>
          </div>

          <div class="example-check">
            <strong>Review:</strong> $A\\mathbf{x}=(4,5)$; the two products differ,
            so $AB\\ne BA$; $\\det A=3$ and $A^{-1}$ has the expected factor
            $1/3$; the eigenvalues satisfy both trace $4$ and determinant $3$; and
            substituting each eigenvector back into $A\\mathbf{v}=\\lambda\\mathbf{v}$
            reproduces the eigenvalue. All five checks agree.
          </div>
        </div>
      </section>

      <section class="chapter-section" id="lab">
        <h2 class="section-title"><span class="section-index">6.5</span> Lab</h2>
        <div data-widget="matrix-lab"></div>
      </section>

      <section class="chapter-section" id="check">
        <h2 class="section-title"><span class="section-index">6.6</span> Check your understanding</h2>
        <div data-widget="linear-algebra-quiz"></div>

        <h3 class="section-title" style="font-size:22px;margin-top:34px">
          <span class="section-index">6.7</span> Mastery checklist
        </h3>
        ${MS.ui.checklist(6, [
          "Multiply matrices by hand and explain the row/column interpretation.",
          "Determine whether a matrix product is shape-valid.",
          "Explain rank and why low-rank structure matters.",
          "Compute eigenvalues of a 2×2 matrix.",
          "Explain the geometry of the SVD.",
          "Count parameters in an MLP and in an attention head."
        ])}
      </section>

      <section class="chapter-section">
        <h2 class="section-title"><span class="section-index">6.8</span> Reading</h2>
        ${MS.ui.readingList([
          { title: "Deisenroth, Faisal & Ong, Mathematics for Machine Learning — Chapters 2–4", source: "Linear algebra, analytic geometry, matrix decompositions" },
          { title: "Stewart, Cálculo Vol. 2 — Chapter 12", source: "Vectors, dot products, and the geometry of space" },
          { title: "Strang, MIT 18.06 — selected lectures", source: "Matrices, elimination, eigenvalues, SVD" },
          { title: "Goodfellow, Bengio & Courville, Deep Learning — Chapter 2", source: "Linear algebra reference" }
        ])}
      </section>

      <footer class="chapter-footer">
        ${MS.ui.completionCard(6)}
      </footer>
    `;
  };

  chapter.mount = function (root) {
    MS.widgets.matrixLab(root.querySelector('[data-widget="matrix-lab"]'));

    MS.createQuiz(root.querySelector('[data-widget="linear-algebra-quiz"]'), {
      id: "linear-algebra",
      chapterId: 6,
      title: "Linear algebra checkpoint",
      subtitle: "Shapes first, arithmetic second.",
      questions: [
        {
          prompt: "What is the shape of $(2\\times3)(3\\times4)$?",
          options: ["2×4", "3×3", "4×2", "2×3"],
          answer: 0,
          explanation: "The inner dimensions match (3), and the outer dimensions give the result: $2\\times4$."
        },
        {
          prompt: "A square matrix with determinant zero is:",
          options: ["Orthogonal", "Singular", "Positive definite", "Symmetric"],
          answer: 1,
          explanation: "A zero determinant means the columns are linearly dependent, so the matrix has no inverse."
        },
        {
          prompt: "Which statement is generally true?",
          options: ["$AB=BA$", "$AB\\ne BA$ in general", "$A+B=AB$", "$A^T=A$"],
          answer: 1,
          explanation: "Matrix multiplication is not commutative; order changes the linear map."
        },
        {
          prompt: "An eigenvector $\\mathbf{v}$ of $A$ satisfies:",
          options: ["$A\\mathbf{v}=0$", "$A\\mathbf{v}=\\lambda\\mathbf{v}$", "$A\\mathbf{v}=\\mathbf{v}^T$", "$A^T\\mathbf{v}=0$"],
          answer: 1,
          explanation: "Eigenvectors are directions that the matrix only scales, by the eigenvalue $\\lambda$."
        },
        {
          prompt: "The SVD writes a matrix as:",
          options: ["$A=U\\Sigma V^T$", "$A=U+V$", "$A=\\Sigma^{-1}$", "$A=UV$"],
          answer: 0,
          explanation: "The SVD factors a matrix into two orthogonal matrices and a diagonal matrix of singular values."
        }
      ]
    });

    MS.ui.bindChecklist(root, 6);
  };

  MS.chapterLoaded = MS.chapterLoaded || {};
  MS.chapterLoaded[6] = true;
})();
