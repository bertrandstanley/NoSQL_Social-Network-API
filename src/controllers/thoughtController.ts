import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Thought from '../models/Thought.js';
import User from '../models/User.js';

// GET all thoughts
export const getAllThoughts = async (_: Request, res: Response): Promise<void> => {
  try {
    const thoughts = await Thought.find();
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving thoughts', error: err });
  }
};

// GET a single thought by ID
export const getThoughtById = async (req: Request, res: Response): Promise<void> => {
  try {
    const thought = await Thought.findById(req.params.thoughtId).populate('reactions');
    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }
    res.status(200).json(thought);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving thought', error: err });
  }
};

// POST a new thought
export const createThought = async (req: Request, res: Response): Promise<void> => {
  const { thoughtText, username, userId } = req.body;

  try {
    const newThought = new Thought({ thoughtText, username, userId });
    await newThought.save();

    // After creating the thought, push its _id to the user's thoughts array
    await User.findByIdAndUpdate(userId, { $push: { thoughts: newThought._id } });

    res.status(201).json(newThought);
  } catch (err) {
    res.status(400).json({ message: 'Error creating thought', error: err });
  }
};

// PUT to update a thought by ID
export const updateThought = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(req.params.thoughtId, req.body, { new: true });
    if (!updatedThought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }
    res.status(200).json(updatedThought);
  } catch (err) {
    res.status(500).json({ message: 'Error updating thought', error: err });
  }
};

// DELETE a thought by ID
export const deleteThought = async (req: Request, res: Response): Promise<void> => {
  try {
    const thought = await Thought.findByIdAndDelete(req.params.thoughtId);
    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }

    // Remove the thought's _id from the associated user's thoughts array
    await User.findByIdAndUpdate(thought.userId, { $pull: { thoughts: thought._id } });

    res.status(200).json({ message: 'Thought deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting thought', error: err });
  }
};

// POST a reaction to a thought
export const addReactionToThought = async (req: Request, res: Response): Promise<void> => {
  const { reactionBody, username } = req.body;

  try {
    const thought = await Thought.findById(req.params.thoughtId);

    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }

    thought.reactions.push({ _id: new mongoose.Types.ObjectId(), reactionBody, username, createdAt: new Date() });
    await thought.save();

    res.status(201).json(thought);
  } catch (err) {
    res.status(500).json({ message: 'Error adding reaction', error: err });
  }
};

// DELETE a reaction from a thought
export const removeReactionFromThought = async (req: Request, res: Response): Promise<void> => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);

    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }

    // Remove reaction by its reactionId
    thought.reactions = thought.reactions.filter(reaction => reaction._id.toString() !== req.params.reactionId);
    await thought.save();

    res.status(200).json({ message: 'Reaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing reaction', error: err });
  }
};
