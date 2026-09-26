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

const GSoCCommunityInteractionSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' },
  platform: { 
    type: String, 
    enum: ['GITHUB', 'DISCORD', 'SLACK', 'MAILING_LIST', 'FORUM', 'COMMUNITY_MEETING', 'ISSUE_DISCUSSION', 'PR_REVIEW'],
    required: true
  },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
  personOrRole: { type: String, default: '' },
  topic: { type: String, required: true },
  question: { type: String, default: '' },
  response: { type: String, default: '' },
  outcome: { type: String, default: '' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' },
  relatedProjectIdea: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProjectIdea' },
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
  url: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for efficient search
GSoCCommunityInteractionSchema.index({ topic: 'text', organization: 'text', platform: 'text' });

export default mongoose.models.GSoCCommunityInteraction || mongoose.model('GSoCCommunityInteraction', GSoCCommunityInteractionSchema);