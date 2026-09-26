import mongoose from 'mongoose';

const ProposalSectionSchema = new mongoose.Schema({
  section: { 
    type: String, 
    enum: ['TITLE', 'ABSTRACT', 'ABOUT_ME', 'MOTIVATION', 'PROBLEM_STATEMENT', 'EXISTING_SYSTEM', 'PROPOSED_SOLUTION', 'TECHNICAL_APPROACH', 'ARCHITECTURE', 'DELIVERABLES', 'MILESTONES', 'TIMELINE', 'TESTING', 'RISKS', 'COMMUNITY_INTERACTION', 'RELATED_CONTRIBUTIONS', 'PRIOR_EXPERIENCE', 'REFERENCES'],
    required: true
  },
  content: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['DRAFT', 'REVIEW', 'COMPLETE'],
    default: 'DRAFT'
  },
  evidenceLinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCEvidence' }],
  lastUpdated: { type: Date, default: Date.now }
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

const GSoCProposalSchema = new mongoose.Schema({
  projectIdea: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProjectIdea', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization', required: true },
  title: { type: String, required: true },
  sections: [ProposalSectionSchema],
  overallStatus: { 
    type: String, 
    enum: ['NOT_STARTED', 'DRAFTING', 'REVIEWING', 'READY', 'SUBMITTED'],
    default: 'NOT_STARTED'
  },
  evidenceCoverage: { type: mongoose.Schema.Types.Mixed, default: {} },
  readinessLevel: { 
    type: String, 
    enum: ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6'],
    default: 'LEVEL_0'
  },
  submissionDate: { type: Date },
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  qualityChecklist: {
    problemTechnicallyUnderstood: { type: Boolean, default: false },
    solutionTechnicallyRealistic: { type: Boolean, default: false },
    architectureClear: { type: Boolean, default: false },
    dependenciesIdentified: { type: Boolean, default: false },
    testingStrategyDefined: { type: Boolean, default: false },
    risksIdentified: { type: Boolean, default: false },
    organizationRepositoryExplored: { type: Boolean, default: false },
    contributionGuideUnderstood: { type: Boolean, default: false },
    existingArchitectureUnderstood: { type: Boolean, default: false },
    issuesInvestigated: { type: Boolean, default: false },
    contributionMade: { type: Boolean, default: false },
    communityInteractionEstablished: { type: Boolean, default: false },
    clearProblemStatement: { type: Boolean, default: false },
    clearDeliverables: { type: Boolean, default: false },
    realisticTimeline: { type: Boolean, default: false },
    milestones: { type: Boolean, default: false },
    evaluationCriteria: { type: Boolean, default: false },
    risksIncluded: { type: Boolean, default: false },
    backupPlan: { type: Boolean, default: false },
    githubEvidence: { type: Boolean, default: false },
    mlProjectEvidence: { type: Boolean, default: false },
    pythonEvidence: { type: Boolean, default: false },
    openSourceEvidence: { type: Boolean, default: false },
    publicTechnicalWork: { type: Boolean, default: false }
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCProposal || mongoose.model('GSoCProposal', GSoCProposalSchema);