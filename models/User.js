import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  primaryGoogleSubject: { type: String, required: true, unique: true, immutable: true, index: true },
  primaryEmail: { type: String, required: true, trim: true, lowercase: true },
  displayName: { type: String, default: '' },
  primaryTaskConnectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthConnection', default: null },
  defaultGoogleTaskListId: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
