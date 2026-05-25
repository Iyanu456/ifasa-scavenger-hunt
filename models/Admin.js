import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  created_at: { type: String },
});

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
