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

const GSoCRepositorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' },
  description: { type: String, default: '' },
  technologyStack: [{ type: String }],
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  issuesCount: { type: Number, default: 0 },
  lastUpdated: { type: Date },
  explored: { type: Boolean, default: false },
  cloned: { type: Boolean, default: false },
  runLocally: { type: Boolean, default: false },
  architectureUnderstood: { type: Boolean, default: false },
  documentationRead: { type: Boolean, default: false },
  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
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

export default mongoose.models.GSoCRepository || mongoose.model('GSoCRepository', GSoCRepositorySchema);