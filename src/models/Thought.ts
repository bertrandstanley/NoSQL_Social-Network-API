import mongoose, { Schema, Document } from 'mongoose';

// Define the Reaction interface
interface IReaction {
  _id: mongoose.Types.ObjectId;
  reactionBody: string;
  username: string;
  createdAt: Date;
}

// Define the Thought interface extending Document
interface IThought extends Document {
  thoughtText: string;
  createdAt: Date;
  username: string;
  userId: Schema.Types.ObjectId;
  reactions: IReaction[];
  reactionCount?: number; // Virtual field for reaction count
}

// Define the Thought Schema
const thoughtSchema = new Schema<IThought>({
  thoughtText: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 280,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reactions: [
    {
      reactionBody: {
        type: String,
        required: true,
        maxlength: 280,
      },
      username: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Add a virtual field for reactionCount
thoughtSchema.virtual('reactionCount').get(function (this: IThought) {
  return this.reactions.length;
});

// Create the Thought model
const Thought = mongoose.model<IThought>('Thought', thoughtSchema);

export default Thought;
