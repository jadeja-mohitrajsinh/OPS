import mongoose from 'mongoose';

const DecisionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  decision: { type: String, required: true },
  context: { type: String, default: '' },
  optionsConsidered: [{ type: String }],
  reason: { type: String, default: '' },
  owner: { type: String, default: 'Me' },
  relatedProject: { type: String, default: '' },
  area: { type: String, default: '' },
  expectedResult: { type: String, default: '' },
  reviewDate: { type: Date },
  outcome: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Decision || mongoose.model('Decision', DecisionSchema);
