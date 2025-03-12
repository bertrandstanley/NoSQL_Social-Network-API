import { Request, Response } from 'express';
import User from '../models/User.js';
import Thought from '../models/Thought.js';
import { Types, Schema } from 'mongoose';

// GET all users
export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate('friends').populate('thoughts');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err });
  }
};

// GET a single user by ID and populate thoughts and friends data
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).populate('friends').populate('thoughts');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err });
  }
};

// POST to create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email } = req.body;

  try {
    const newUser = new User({ username, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err });
  }
};

// PUT to update a user by ID
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err });
  }
};

// DELETE a user by ID and associated thoughts
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete all the thoughts associated with the user
    await Thought.deleteMany({ userId: user._id });

    res.status(200).json({ message: 'User and associated thoughts deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err });
  }
};

// POST to add a friend to a user's friend list
export const addFriend = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    const friend = await User.findById(req.params.friendId);

    if (!user || !friend) {
      res.status(404).json({ message: 'User or Friend not found' });
      return;
    }

    // Add the friend to the user's friend list
    user.friends.push(friend._id as unknown as Types.ObjectId as unknown as Schema.Types.ObjectId);
    await user.save();

    // Add the user to the friend's friend list
    friend.friends.push(user._id as unknown as Types.ObjectId as unknown as Schema.Types.ObjectId);
    await friend.save();

    res.status(200).json({ message: 'Friend added' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding friend', error: err });
  }
};

// DELETE to remove a friend from a user's friend list
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    const friend = await User.findById(req.params.friendId);

    if (!user || !friend) {
      res.status(404).json({ message: 'User or Friend not found' });
      return;
    }

    // Remove the friend from the user's friend list
    user.friends = user.friends.filter(friendId => friendId.toString() !== (friend._id as unknown as string).toString());
    await user.save();

    // Remove the user from the friend's friend list
    friend.friends = friend.friends.filter(friendId => friendId.toString() !== (user._id as unknown as string).toString());
    await friend.save();

    res.status(200).json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing friend', error: err });
  }
};
