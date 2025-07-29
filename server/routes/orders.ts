import express from 'express';
export const ordersRouter = express.Router();

// TODO: Implement orders routes
ordersRouter.get('/', (req, res) => {
  res.json({ message: 'Orders route not implemented yet' });
});