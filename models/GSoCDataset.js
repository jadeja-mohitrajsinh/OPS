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

const GSoCDatasetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  domain: { 
    type: String, 
    enum: ['COMPUTER_VISION', 'NLP', 'TABULAR', 'AUDIO', 'VIDEO', 'TIME_SERIES', 'GRAPH', 'RECOMMENDATION', 'OTHER'],
    required: true
  },
  source: { type: String, default: '' },
  url: { type: String, default: '' },
  huggingFaceUrl: { type: String, default: '' },
  kaggleUrl: { type: String, default: '' },
  size: { 
    samples: { type: Number, default: 0 },
    features: { type: Number, default: 0 },
    sizeMB: { type: Number, default: 0 }
  },
  format: { type: String, default: '' },
  license: { type: String, default: '' },
  tasks: [{ type: String }],
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  relatedExperiments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCExperiment' }],
  relatedContributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  relatedCommunityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  relatedDatasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCDataset' }],
  documentation: { type: String, default: '' },
  preprocessing: { type: String, default: '' },
  qualityChecklist: {
    documented: { type: Boolean, default: false },
    downloaded: { type: Boolean, default: false },
    explored: { type: Boolean, default: false },
    cleaned: { type: Boolean, default: false },
    preprocessed: { type: Boolean, default: false },
    validated: { type: Boolean, default: false },
    versionControlled: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['DISCOVERED', 'DOWNLOADED', 'EXPLORING', 'READY', 'IN_USE', 'ARCHIVED'],
    default: 'DISCOVERED'
  },
  dueDate: { type: Date },
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for efficient search
GSoCDatasetSchema.index({ name: 'text', description: 'text', domain: 'text' });

export default mongoose.models.GSoCDataset || mongoose.model('GSoCDataset', GSoCDatasetSchema);
