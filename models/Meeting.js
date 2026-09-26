import mongoose from 'mongoose';

const ActionItemSchema = new mongoose.Schema({
  task: { type: String, required: true },
  owner: { type: String, default: 'Me' },
  deadline: { type: Date },
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  status: { type: String, enum: ['OPEN', 'DONE'], default: 'OPEN' },
});

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  location: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  meetingLink: { type: String, default: '' },
  people: [{ type: mongoose.Schema.Types.Mixed }],
  organization: { type: String, default: '' },
  project: { type: String, default: '' },
  purpose: { type: String, default: '' },
  agenda: { type: String, default: '' },
  notes: { type: String, default: '' },
  decisions: [{ type: String }],
  actionItems: [ActionItemSchema],
  followUpDate: { type: Date },
  followUpPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  attachments: [{ type: String }],
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'], default: 'SCHEDULED' },
  preparationChecklist: [{
    item: { type: String },
    done: { type: Boolean, default: false }
  }],
  nextMeetingDate: { type: Date },
  nextMeetingNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);
