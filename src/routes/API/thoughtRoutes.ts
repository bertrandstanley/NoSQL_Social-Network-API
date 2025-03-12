import { Router, Request, Response } from 'express';
import Thought from '../../models/Thought.js';
import User from '../../models/User.js'; 
import { Schema } from 'mongoose';

const router = Router();

// GET all thoughts
router.get('/', async (_, res) => {
  try {
    const thoughts = await Thought.find().populate('reactions');
    res.json(thoughts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single thought by _id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const thought = await Thought.findById(req.params.id).populate('reactions');
    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
    } else {
      res.json(thought);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST to create a new thought
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { thoughtText, username, userId } = req.body;
    const thought = new Thought({ thoughtText, username, userId });
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.thoughts.push(thought._id as unknown as Schema.Types.ObjectId);
    await user.save();
    await thought.save();
    res.status(201).json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT to update a thought by _id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedThought) {
      res.status(404).json({ message: 'Thought not found' });
    }
    res.json(updatedThought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE to remove a thought by _id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedThought = await Thought.findByIdAndDelete(req.params.id);
    if (!deletedThought) {
      res.status(404).json({ message: 'Thought not found' });
    }
    res.json(deletedThought);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST to create a reaction
router.post('/:thoughtId/reactions', async (req: Request<{ thoughtId: string }>, res: Response): Promise<void> => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);
    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }
    thought.reactions.push(req.body);
    await thought.save();
    res.status(201).json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a reaction by reactionId
router.delete('/:thoughtId/reactions/:reactionId', async (req: Request<{ thoughtId: string; reactionId: string }>, res: Response): Promise<void> => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);
    if (!thought) {
      res.status(404).json({ message: 'Thought not found' });
      return;
    }
    thought.reactions = thought.reactions.filter(reaction => reaction._id.toString() !== req.params.reactionId);
    await thought.save();
    res.json(thought);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
