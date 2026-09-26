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

const GSoCGoalSchema = new mongoose.Schema({
  targetYear: { type: Number, required: true, default: 2027 },
  focusArea: { type: String, required: true, default: 'AI/ML + Python' },
  primaryOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' },
  primaryProjectIdea: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProjectIdea' },
  currentReadinessLevel: { 
    type: String, 
    enum: ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6'],
    default: 'LEVEL_0'
  },
  overallEvidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  technicalReadiness: { type: Number, default: 0 },
  projectEvidence: { type: Number, default: 0 },
  openSourceReadiness: { type: Number, default: 0 },
  organizationReadiness: { type: Number, default: 0 },
  communityReadiness: { type: Number, default: 0 },
  proposalReadiness: { type: Number, default: 0 },
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  applicationDeadline: { type: Date },
  startDate: { type: Date, default: Date.now },
  targetSubmissionDate: { type: Date },
  status: { 
    type: String, 
    enum: ['PLANNING', 'PREPARING', 'ACTIVE', 'PAUSED', 'SUBMITTED', 'ACCEPTED', 'REJECTED'],
    default: 'PLANNING'
  },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' }],
  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  experiments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCExperiment' }],
  communityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  projectIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProjectIdea' }],
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProposal' }],
  portfolioItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCPublicPortfolio' }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCGoal || mongoose.model('GSoCGoal', GSoCGoalSchema);