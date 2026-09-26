import mongoose from 'mongoose';

const ProjectMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
    default: 'PENDING'
  },
  evidenceUrl: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const QualityChecklistSchema = new mongoose.Schema({
  clearProblemStatement: { type: Boolean, default: false },
  datasetDocumented: { type: Boolean, default: false },
  baselineImplemented: { type: Boolean, default: false },
  modelImplemented: { type: Boolean, default: false },
  evaluationMetrics: { type: Boolean, default: false },
  experimentComparison: { type: Boolean, default: false },
  errorAnalysis: { type: Boolean, default: false },
  reproducibleEnvironment: { type: Boolean, default: false },
  tests: { type: Boolean, default: false },
  readme: { type: Boolean, default: false },
  resultsDocumented: { type: Boolean, default: false },
  githubRepository: { type: Boolean, default: false },
  demo: { type: Boolean, default: false }
});

const TimelineGateSchema = new mongoose.Schema({
  gate: { 
    type: String, 
    enum: ['L1', 'L2', 'L3', 'L4', 'L5'],
    default: 'L1'
  },
  gateName: { type: String, default: '' },
  startDate: { type: Date },
  targetDate: { type: Date },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
    default: 'NOT_STARTED'
  },
  criteria: [{ type: String }],
  notes: { type: String, default: '' }
});

const GSoCProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  problem: { type: String, required: true },
  domain: { 
    type: String, 
    enum: ['MACHINE_LEARNING', 'DEEP_LEARNING', 'COMPUTER_VISION', 'NLP', 'LLM', 'GENERATIVE_AI', 'REINFORCEMENT_LEARNING', 'SCIENTIFIC_ML', 'MLOPS'],
    required: true
  },
  dataset: { type: String, default: '' },
  model: { type: String, default: '' },
  framework: { type: String, default: '' },
  repository: { type: String, default: '' },
  demo: { type: String, default: '' },
  huggingFace: { type: String, default: '' },
  kaggle: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['IDEA', 'RESEARCH', 'DEVELOPMENT', 'TESTING', 'COMPLETED', 'DEPLOYED', 'ARCHIVED'],
    default: 'IDEA'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  dueDate: { type: Date },
  milestones: [ProjectMilestoneSchema],
  qualityChecklist: QualityChecklistSchema,
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  experiments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCExperiment' }],
  relatedContributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  relatedCommunityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  relatedDatasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCDataset' }],
  publicPortfolioItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCPublicPortfolio' }],
  complexity: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], default: 'BEGINNER' },
  targetOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for efficient search
GSoCProjectSchema.index({ name: 'text', problem: 'text', domain: 'text' });

export default mongoose.models.GSoCProject || mongoose.model('GSoCProject', GSoCProjectSchema);