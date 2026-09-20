import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['LEARN', 'UNDERSTAND', 'PRACTICE', 'PYQS', 'REVISE', 'TEST', 'MASTERED'], default: 'LEARN' },
  notes: { type: String, default: '' },
  questionsAttempted: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // percentage
  isWeak: { type: Boolean, default: false },
  revisionCount: { type: Number, default: 0 },
  lastRevised: { type: Date },
});

const MockScoreSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  score: { type: Number },
  totalMarks: { type: Number, default: 100 },
  accuracy: { type: Number },
  notes: { type: String, default: '' },
});

const GateSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topics: [TopicSchema],
  questionsAttempted: { type: Number, default: 0 },
  pyqsCompleted: { type: Number, default: 0 },
  mockScores: [MockScoreSchema],
  timeSpent: { type: Number, default: 0 }, // hours
  overallStatus: { type: String, enum: ['LEARN', 'UNDERSTAND', 'PRACTICE', 'PYQS', 'REVISE', 'TEST', 'MASTERED'], default: 'LEARN' },
  priority: { type: Number, default: 1 }, // order
}, { timestamps: true });

export default mongoose.models.GateSubject || mongoose.model('GateSubject', GateSubjectSchema);
