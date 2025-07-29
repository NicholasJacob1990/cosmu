import express from 'express';
export const reviewsRouter = express.Router();

// TODO: Implement reviews routes
reviewsRouter.get('/', (req, res) => {
  res.json({ message: 'Reviews route not implemented yet' });
});