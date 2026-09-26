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

const GSoCContributionSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCRepository' },
  issueNumber: { type: Number, default: 0 },
  issueUrl: { type: String, default: '' },
  issueTitle: { type: String, default: '' },
  contributionType: { 
    type: String, 
    enum: ['BUG_FIX', 'FEATURE', 'DOCUMENTATION', 'TESTING', 'REFACTORING', 'PERFORMANCE', 'ML_MODEL', 'DATASET', 'RESEARCH', 'TOOLING'],
    required: true
  },
  date: { type: Date, default: Date.now },
  deadline: { type: Date },
  status: { 
    type: String, 
    enum: ['INVESTIGATING', 'DISCUSSING', 'WORKING', 'PR_OPEN', 'CHANGES_REQUESTED', 'APPROVED', 'MERGED', 'CLOSED'],
    default: 'INVESTIGATING'
  },
  prUrl: { type: String, default: '' },
  commitUrl: { type: String, default: '' },
  reviewStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'NO_REVIEW'], default: 'PENDING' },
  result: { type: String, enum: ['SUCCESS', 'PARTIAL', 'FAILED', 'ABANDONED'], default: 'SUCCESS' },
  whatILearned: { type: String, default: '' },
  relatedSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' },
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  relatedExperiments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCExperiment' }],
  relatedContributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  relatedCommunityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  relatedDatasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCDataset' }],
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

export default mongoose.models.GSoCContribution || mongoose.model('GSoCContribution', GSoCContributionSchema);