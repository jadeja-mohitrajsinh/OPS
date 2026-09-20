import mongoose from 'mongoose';

const CommitmentSchema = new mongoose.Schema({
  description: { type: String, required: true },
  type: { type: String, enum: ['I_OWE', 'THEY_OWE'], default: 'THEY_OWE' },
  dueDate: { type: Date },
  status: { type: String, enum: ['OPEN', 'DONE', 'CANCELLED'], default: 'OPEN' },
});

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  organization: { type: String, default: '' },
  relationship: { type: String, enum: ['Team', 'Mentor', 'Investor', 'Friend', 'Professor', 'Classmate', 'Client', 'Other'], default: 'Other' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  currentProject: { type: String, default: '' },
  lastInteraction: { type: Date },
  nextInteraction: { type: Date },
  commitments: [CommitmentSchema],
  meetingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }],
  notes: { type: String, default: '' },
  importantContext: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Person || mongoose.model('Person', PersonSchema);
