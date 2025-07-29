import express from 'express';
export const messagesRouter = express.Router();

// TODO: Implement messages routes
messagesRouter.get('/', (req, res) => {
  res.json({ message: 'Messages route not implemented yet' });
});