import mongoose from 'mongoose';

const TimelineItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  title: { type: String, required: true },
  type: { type: String, default: 'task' },
  color: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  taskId: { type: String, default: null },
  notes: { type: String, default: '' },
  link: { type: String, default: null },
  attendees: { type: mongoose.Schema.Types.Mixed, default: null },
}, { _id: false });

const TodayTimelineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  items: { type: [TimelineItemSchema], default: [] },
}, { timestamps: true });

TodayTimelineSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.TodayTimeline || mongoose.model('TodayTimeline', TodayTimelineSchema);
