import mongoose from 'mongoose';

const FeatureScoreSchema = new mongoose.Schema({
  feature: { type: String, required: true },
  competitorSupport: { type: String, enum: ['YES', 'PARTIAL', 'NO', 'SUPERIOR'], default: 'YES' },
  ourSupport: { type: String, enum: ['YES', 'PARTIAL', 'NO', 'SUPERIOR'], default: 'SUPERIOR' },
  note: { type: String, default: '' },
}, { _id: false });

const CompetitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  website: { type: String, default: '' },
  category: {
    type: String,
    enum: ['DIRECT', 'INDIRECT', 'ASPIRATIONAL', 'ADJACENT', 'POTENTIAL'],
    default: 'DIRECT'
  },
  threatLevel: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'WATCHING'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DOMINANT', 'EMERGING', 'DECLINING', 'ACQUIRED'],
    default: 'ACTIVE'
  },
  pricingModel: { type: String, default: '' }, // e.g. Freemium ($20/mo), Usage-based, Enterprise
  targetAudience: { type: String, default: '' }, // ICP
  keyFeatures: [{ type: String }],
  strengths: [{ type: String }], // What they do best
  weaknesses: [{ type: String }], // Vulnerabilities & pain points
  ourDifferentiator: { type: String, default: '' }, // Our moat / unfair advantage
  marketShareNotes: { type: String, default: '' }, // Funding, ARR, DAU, traction
  featureScores: [FeatureScoreSchema],
  swot: {
    strengths: { type: String, default: '' },
    weaknesses: { type: String, default: '' },
    opportunities: { type: String, default: '' },
    threats: { type: String, default: '' },
  },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Competitor || mongoose.model('Competitor', CompetitorSchema);
