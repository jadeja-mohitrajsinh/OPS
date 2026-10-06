import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['NOT_STARTED', 'LEARNING', 'PRACTICED', 'REVISED', 'EXAM_READY'], default: 'NOT_STARTED' },
  notes: { type: String, default: '' },
  topics: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  }],
});

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['PENDING', 'SUBMITTED', 'OVERDUE'], default: 'PENDING' },
  notes: { type: String, default: '' },
});

const CollegeSubjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, default: '' },
  semester: { type: String, default: '' },
  professor: { type: String, default: '' },
  units: [UnitSchema],
  assignments: [AssignmentSchema],
  viva: {
    date: { type: Date },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'NOT_SCHEDULED'], default: 'NOT_SCHEDULED' },
    notes: { type: String, default: '' },
  },
  practical: {
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'NOT_APPLICABLE'], default: 'NOT_APPLICABLE' },
    notes: { type: String, default: '' },
  },
  internalMarks: { type: Number, default: 0 },
  examDate: { type: Date },
  status: { type: String, enum: ['NOT_STARTED', 'LEARNING', 'PRACTICED', 'REVISED', 'EXAM_READY'], default: 'NOT_STARTED' },
  mid2Status: { type: String, enum: ['PENDING', 'COMPLETED', 'NOT_SCHEDULED'], default: 'PENDING' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.CollegeSubject || mongoose.model('CollegeSubject', CollegeSubjectSchema);
