import mongoose from 'mongoose';

const OAuthStateSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true, index: true },
  connectionType: { type: String, enum: ['primary_identity', 'connected_gmail'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  codeVerifier: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.models.OAuthState || mongoose.model('OAuthState', OAuthStateSchema);
