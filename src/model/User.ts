// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  name: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
