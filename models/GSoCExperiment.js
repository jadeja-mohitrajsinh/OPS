import mongoose from 'mongoose';

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

const GSoCExperimentSchema = new mongoose.Schema({
  experimentId: { type: String, required: true, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject', required: true },
  hypothesis: { type: String, required: true },
  dataset: { type: String, default: '' },
  model: { type: String, default: '' },
  parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
  training: { 
    epochs: { type: Number, default: 0 },
    batchSize: { type: Number, default: 0 },
    learningRate: { type: Number, default: 0 },
    optimizer: { type: String, default: '' },
    lossFunction: { type: String, default: '' }
  },
  evaluation: {
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    validationScore: { type: Number, default: 0 },
    testScore: { type: Number, default: 0 }
  },
  results: { type: String, default: '' },
  comparison: { type: String, default: '' },
  failure: { type: String, default: '' },
  conclusion: { type: String, default: '' },
  gitCommit: { type: String, default: '' },
  notebook: { type: String, default: '' },
  configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { 
    type: String, 
    enum: ['PLANNED', 'RUNNING', 'COMPLETED', 'FAILED', 'ARCHIVED'],
    default: 'PLANNED'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  dueDate: { type: Date },
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  relatedExperiments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCExperiment' }],
  relatedContributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  relatedCommunityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  relatedDatasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCDataset' }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for efficient search
GSoCExperimentSchema.index({ experimentId: 'text', hypothesis: 'text', model: 'text' });

export default mongoose.models.GSoCExperiment || mongoose.model('GSoCExperiment', GSoCExperimentSchema);