import mongoose from 'mongoose';

const EmailTaskLinkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthConnection', required: true },
  gmailMessageId: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  destinationTaskListId: { type: String, required: true },
  idempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models.EmailTaskLink || mongoose.model('EmailTaskLink', EmailTaskLinkSchema);
