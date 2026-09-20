import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GateSubject from '@/models/GateSubject';
import CollegeSubject from '@/models/CollegeSubject';

// Official GATE 2027 IIT Madras - DA (Data Science & AI) Syllabus
const GATE_DA_2027_SECTIONS = [
  {
    name: 'Section 1: Probability and Statistics',
    priority: 1,
    topics: [
      { name: 'Counting (Permutations & Combinations)' },
      { name: 'Probability Axioms, Sample Space & Events' },
      { name: 'Independent & Mutually Exclusive Events' },
      { name: 'Marginal, Conditional and Joint Probability' },
      { name: 'Bayes Theorem' },
      { name: 'Conditional Expectation and Variance' },
      { name: 'Mean, Median, Mode and Standard Deviation' },
      { name: 'Correlation and Covariance' },
      { name: 'Discrete Random Variables & PMF (Uniform, Bernoulli, Binomial)' },
      { name: 'Continuous Random Variables & PDF (Uniform, Exponential, Poisson, Normal, Standard Normal)' },
      { name: 't-distribution, Chi-squared Distribution & Cumulative Distribution Function (CDF)' },
      { name: 'Conditional PDF & Central Limit Theorem (CLT)' },
      { name: 'Confidence Intervals & Hypothesis Testing (z-test, t-test, chi-squared test)' },
    ],
  },
  {
    name: 'Section 2: Linear Algebra',
    priority: 2,
    topics: [
      { name: 'Vector Space & Subspaces' },
      { name: 'Linear Dependence & Independence of Vectors' },
      { name: 'Matrices & Matrix Properties (Projection, Orthogonal, Idempotent, Partition)' },
      { name: 'Quadratic Forms' },
      { name: 'Systems of Linear Equations & Gaussian Elimination' },
      { name: 'Eigenvalues and Eigenvectors' },
      { name: 'Determinant, Rank and Nullity' },
      { name: 'Projections' },
      { name: 'LU Decomposition' },
      { name: 'Singular Value Decomposition (SVD)' },
    ],
  },
  {
    name: 'Section 3: Calculus and Optimization',
    priority: 3,
    topics: [
      { name: 'Functions of a Single Variable' },
      { name: 'Limits, Continuity and Differentiability' },
      { name: 'Taylor Series' },
      { name: 'Maxima and Minima' },
      { name: 'Optimization Involving a Single Variable' },
    ],
  },
  {
    name: 'Section 4: Programming, Data Structures and Algorithms',
    priority: 4,
    topics: [
      { name: 'Programming in Python' },
      { name: 'Basic Data Structures (Stacks, Queues, Linked Lists, Trees, Hash Tables)' },
      { name: 'Search Algorithms (Linear Search, Binary Search)' },
      { name: 'Basic Sorting Algorithms (Selection Sort, Bubble Sort, Insertion Sort)' },
      { name: 'Divide and Conquer (Merge Sort, Quick Sort)' },
      { name: 'Introduction to Graph Theory' },
      { name: 'Basic Graph Algorithms (Traversals & Shortest Path)' },
    ],
  },
  {
    name: 'Section 5: Database Management and Warehousing',
    priority: 5,
    topics: [
      { name: 'ER-Model' },
      { name: 'Relational Model (Relational Algebra, Tuple Calculus)' },
      { name: 'SQL & Integrity Constraints' },
      { name: 'Normal Forms (Normalization)' },
      { name: 'File Organization & Indexing' },
      { name: 'Data Transformation (Normalization, Discretization, Sampling, Compression)' },
      { name: 'Data Warehouse Modelling (Multidimensional Schema, Concept Hierarchies)' },
      { name: 'Measures: Categorization and Computations' },
    ],
  },
  {
    name: 'Section 6: Machine Learning',
    priority: 6,
    topics: [
      { name: 'Supervised Learning: Regression and Classification Problems' },
      { name: 'Simple Linear Regression & Multiple Linear Regression' },
      { name: 'Ridge Regression' },
      { name: 'Logistic Regression' },
      { name: 'k-Nearest Neighbour (k-NN)' },
      { name: 'Naive Bayes Classifier' },
      { name: 'Linear Discriminant Analysis (LDA)' },
      { name: 'Support Vector Machine (SVM)' },
      { name: 'Decision Trees' },
      { name: 'Bias-Variance Trade-off' },
      { name: 'Cross-Validation Methods (LOO Cross-Validation, k-Folds Cross-Validation)' },
      { name: 'Multi-Layer Perceptron (MLP) & Feed-Forward Neural Networks' },
      { name: 'Unsupervised Learning: Clustering (k-means / k-medoid)' },
      { name: 'Hierarchical Clustering (Top-down, Bottom-up, Single/Multiple Linkage)' },
      { name: 'Dimensionality Reduction: Principal Component Analysis (PCA)' },
    ],
  },
  {
    name: 'Section 7: AI (Artificial Intelligence)',
    priority: 7,
    topics: [
      { name: 'Search Algorithms: Informed, Uninformed, Adversarial' },
      { name: 'Logic: Propositional Logic, Predicate Logic' },
      { name: 'Reasoning Under Uncertainty: Conditional Independence Representation' },
      { name: 'Exact Inference through Variable Elimination' },
      { name: 'Approximate Inference through Sampling' },
    ],
  },
];

const COLLEGE_SUBJECTS = [
  { name: 'Artificial Intelligence', code: 'AI', units: [
    { name: 'Unit 1: Search' }, { name: 'Unit 2: Knowledge' }, { name: 'Unit 3: Planning' },
    { name: 'Unit 4: ML Basics' }, { name: 'Unit 5: Applications' },
  ]},
  { name: 'Machine Learning', code: 'ML', units: [
    { name: 'Unit 1: Foundations' }, { name: 'Unit 2: Supervised' }, { name: 'Unit 3: Unsupervised' },
    { name: 'Unit 4: Deep Learning' }, { name: 'Unit 5: Advanced' },
  ]},
  { name: 'Design & Analysis of Algorithms', code: 'DAA', units: [
    { name: 'Unit 1: Complexity' }, { name: 'Unit 2: Divide & Conquer' }, { name: 'Unit 3: Greedy' },
    { name: 'Unit 4: Dynamic Programming' }, { name: 'Unit 5: Graph Algorithms' },
  ]},
  { name: 'Database Management Systems', code: 'DBMS', units: [
    { name: 'Unit 1: ER Model' }, { name: 'Unit 2: Relational Model' }, { name: 'Unit 3: SQL' },
    { name: 'Unit 4: Normalization' }, { name: 'Unit 5: Transactions' },
  ]},
  { name: 'Mathematics', code: 'MATH', units: [
    { name: 'Unit 1: Calculus' }, { name: 'Unit 2: Linear Algebra' }, { name: 'Unit 3: Probability' },
    { name: 'Unit 4: Statistics' }, { name: 'Unit 5: Discrete Math' },
  ]},
];

export async function GET(request) {
  return POST(request);
}

export async function POST(request) {
  try {
    await dbConnect();
    const url = new URL(request ? request.url : 'http://localhost:3000/api/seed');
    const force = url.searchParams.get('force') === 'true';

    if (force) {
      await GateSubject.deleteMany({});
      await GateSubject.insertMany(GATE_DA_2027_SECTIONS);
      return NextResponse.json({
        success: true,
        message: 'Force synced official GATE 2027 DA syllabus (7 Sections, all topics).',
        sectionsCount: GATE_DA_2027_SECTIONS.length,
      });
    }

    const gateCount = await GateSubject.countDocuments();
    const collegeCount = await CollegeSubject.countDocuments();

    let gateSeeded = 0;
    let collegeSeeded = 0;

    if (gateCount === 0) {
      await GateSubject.insertMany(GATE_DA_2027_SECTIONS);
      gateSeeded = GATE_DA_2027_SECTIONS.length;
    }

    if (collegeCount === 0) {
      await CollegeSubject.insertMany(COLLEGE_SUBJECTS);
      collegeSeeded = COLLEGE_SUBJECTS.length;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${gateSeeded} GATE DA 2027 subjects and ${collegeSeeded} college subjects.`,
      alreadySeeded: gateCount > 0 || collegeCount > 0,
      totalGateSubjects: gateCount > 0 ? gateCount : gateSeeded,
    });
  } catch (error) {
    console.error('API /api/seed error:', error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
