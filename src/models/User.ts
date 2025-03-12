import { Schema, model, Document } from 'mongoose';

// Define the User interface
interface IUser extends Document {
  username: string;
  email: string;
  thoughts: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
  friendCount?: number;  // Virtual field to count friends
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  thoughts: [{ type: Schema.Types.ObjectId, ref: 'Thought' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

// Virtual for friendCount
userSchema.virtual('friendCount').get(function (this: IUser) {
  return this.friends.length;
});

const User = model<IUser>('User', userSchema);

export default User;
