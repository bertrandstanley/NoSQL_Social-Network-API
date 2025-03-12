import { Router } from 'express';
import userRoutes from './userRoutes.js';  // Import user-specific routes
import thoughtRoutes from './thoughtRoutes.js';  // Import thought-specific routes

const router = Router();

// Use userRoutes for `/users` path
router.use('/users', userRoutes);

// Use thoughtRoutes for `/thoughts` path
router.use('/thoughts', thoughtRoutes);

export default router;
