import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { freelancersRouter } from './routes/freelancers.js';
// import { projectsRouter } from './routes/projects.js'; // TODO: Implement projects/proposals tables
import { servicesRouter } from './routes/services.js';
// import { messagesRouter } from './routes/messages.js'; // TODO: Implement messages table
// import { ordersRouter } from './routes/orders.js'; // TODO: Implement orders table
// import { reviewsRouter } from './routes/reviews.js'; // TODO: Implement reviews table
// import { documentsRouter } from './routes/documents.js'; // TODO: Implement documents table
// import { coverageRouter } from './routes/coverage.js'; // TODO: Implement coverage table
// import { pricingRouter } from './routes/pricing.js'; // TODO: Check dependencies
// import { categoriesRouter } from './routes/categories.js'; // TODO: Implement categories table
// import { portfolioRouter } from './routes/portfolio.js'; // TODO: Implement portfolio table
// import { searchRouter } from './routes/search.js'; // TODO: Check dependencies
// import { qnaRouter } from './routes/qna.js'; // TODO: Implement qna table
// import { paymentsRouter } from './routes/payments.js'; // TODO: Check dependencies
// import { dashboardRouter } from './routes/dashboard.js'; // TODO: Check dependencies
import { subscriptionsRouter } from './routes/subscriptions.js';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'galaxia-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/freelancers', freelancersRouter);
// app.use('/api/projects', projectsRouter); // TODO: Implement projects/proposals tables
app.use('/api/services', servicesRouter);
// app.use('/api/messages', messagesRouter); // TODO: Implement messages table
// app.use('/api/orders', ordersRouter); // TODO: Implement orders table
// app.use('/api/reviews', reviewsRouter); // TODO: Implement reviews table
// app.use('/api/documents', documentsRouter); // TODO: Implement documents table
// app.use('/api/coverage', coverageRouter); // TODO: Implement coverage table
// app.use('/api/pricing', pricingRouter); // TODO: Check dependencies
// app.use('/api/categories', categoriesRouter); // TODO: Implement categories table
// app.use('/api/portfolio', portfolioRouter); // TODO: Implement portfolio table
// app.use('/api/search', searchRouter); // TODO: Check dependencies
// app.use('/api/qna', qnaRouter); // TODO: Implement qna table
// app.use('/api/payments', paymentsRouter); // TODO: Check dependencies
// app.use('/api/dashboard', dashboardRouter); // TODO: Check dependencies
app.use('/api/subscriptions', subscriptionsRouter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// WebSocket handling for real-time messaging
const clients = new Map<string, any>();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'auth':
          clients.set(data.userId, ws);
          ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
          break;
          
        case 'message':
          const recipient = clients.get(data.recipientId);
          if (recipient && recipient.readyState === ws.OPEN) {
            recipient.send(JSON.stringify({
              type: 'message',
              message: data.message
            }));
          }
          break;
          
        case 'typing':
          const typingRecipient = clients.get(data.recipientId);
          if (typingRecipient && typingRecipient.readyState === ws.OPEN) {
            typingRecipient.send(JSON.stringify({
              type: 'typing',
              userId: data.userId,
              isTyping: data.isTyping
            }));
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    // Remove client from map
    for (const [userId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(userId);
        break;
      }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 WebSocket server ready`);
});