import { Router, Request, Response } from 'express';
import User from '../../models/User.js'; // Assuming your User model is correct
import { Schema } from 'mongoose';

// Create a new router
const router = Router();

// GET all users
router.get('/', async (_: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate('thoughts').populate('friends');
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single user by _id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('thoughts').populate('friends');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST to create a new user
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT to update a user by _id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a user by _id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
    }
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST to add a friend
router.post('/:userId/friends/:friendId', async (req: Request<{ userId: string, friendId: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    const friend = await User.findById(req.params.friendId);
    if (!user || !friend) {
      res.status(404).json({ message: 'User or friend not found' });
      return;
    }
    user.friends.push(friend._id as unknown as Schema.Types.ObjectId);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE to remove a friend
router.delete('/:userId/friends/:friendId', async (req: Request<{ userId: string, friendId: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.friends = user.friends.filter(friendId => friendId.toString() !== req.params.friendId);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
