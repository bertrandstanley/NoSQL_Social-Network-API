import express from 'express';
import userRoutes from './API/userRoutes.js';
import thoughtRoutes from './API/thoughtRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/thoughts', thoughtRoutes);

export default router;
