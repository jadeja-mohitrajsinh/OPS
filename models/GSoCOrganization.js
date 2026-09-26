import mongoose from 'mongoose';

const ReadinessChecklistSchema = new mongoose.Schema({
  readOrganizationWebsite: { type: Boolean, default: false },
  readContributionGuide: { type: Boolean, default: false },
  readPreviousGSoCProjects: { type: Boolean, default: false },
  readProjectIdeas: { type: Boolean, default: false },
  cloneRepository: { type: Boolean, default: false },
  runRepositoryLocally: { type: Boolean, default: false },
  understandArchitecture: { type: Boolean, default: false },
  readDocumentation: { type: Boolean, default: false },
  findBeginnerIssues: { type: Boolean, default: false },
  investigateIssue: { type: Boolean, default: false },
  participateInDiscussion: { type: Boolean, default: false },
  makeFirstContribution: { type: Boolean, default: false },
  makeMeaningfulContribution: { type: Boolean, default: false },
  understandPotentialGSoCProject: { type: Boolean, default: false },
  discussProjectWithCommunity: { type: Boolean, default: false }
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

const GSoCOrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  website: { type: String, default: '' },
  github: { type: String, default: '' },
  gsocYear: { type: Number, default: 2027 },
  aiMlRelevance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'], default: 'MEDIUM' },
  pythonRelevance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'], default: 'MEDIUM' },
  description: { type: String, default: '' },
  technologyStack: [{ type: String }],
  previousGSoCProjects: [{ type: String }],
  currentProjectIdeas: [{ type: String }],
  communityChannels: [{ type: String }],
  contributionGuide: { type: String, default: '' },
  communicationChannels: [{ type: String }],
  readinessChecklist: ReadinessChecklistSchema,
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCRepository' }],
  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  communityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  projectIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProjectIdea' }],
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  status: { 
    type: String, 
    enum: ['RESEARCHING', 'INTERESTED', 'ACTIVE', 'PAUSED', 'NOT_TARGET'],
    default: 'RESEARCHING'
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCOrganization || mongoose.model('GSoCOrganization', GSoCOrganizationSchema);