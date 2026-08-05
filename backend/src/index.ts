process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

console.log("[Startup] Initializing dotenv...");
dotenv.config();
console.log("[Startup] dotenv initialized.");

console.log("[Startup] Importing internal modules...");
import { createServer } from 'http';
import { initSocket } from './config/socket.js';
import { bootstrapDatabase } from './utils/bootstrap.js';
import prisma from './config/db.js';
console.log("[Startup] Internal modules imported.");

console.log("[Startup] Validating environment variables...");
const requiredEnv = ['CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY', 'DATABASE_URL'];
requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`[Startup] Warning: Environment variable "${envVar}" is not set.`);
  }
});

console.log("[Startup] Importing routes...");
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import societyRoutes from './routes/societyRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import awardRoutes from './routes/awardRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { errorHandler } from './middlewares/error.js';
console.log("[Startup] Routes imported.");

console.log("[Startup] Creating Express app...");
const app = express();
console.log("[Startup] Express app created.");

console.log("[Startup] Configuring middlewares...");
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const localAllowed = [
        'http://localhost:5180', 'http://127.0.0.1:5180',
        'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost:5181', 'http://127.0.0.1:5181',
        'https://society-management-portal-zeta.vercel.app',
        'https://my-fix-frontend.vercel.app',
      ];
      const envAllowed = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
      const isVercel = origin.startsWith('https://society-management-portal') && origin.endsWith('.vercel.app');

      if (localAllowed.includes(origin) || envAllowed.includes(origin) || isVercel) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
import { rateLimiter } from './middlewares/rateLimiter.js';
app.use(rateLimiter);
console.log("[Startup] Middlewares configured.");

console.log("[Startup] Registering routes...");
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/societies', societyRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/awards', awardRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1', collaborationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date(), service: 'society-management-backend' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Resource not found: ${req.originalUrl}` });
});
app.use(errorHandler);
console.log("[Startup] Routes registered.");

console.log("[Startup] Creating HTTP server and initializing socket...");
const server = createServer(app);
initSocket(server);
console.log("[Startup] Socket initialized.");

console.log("[Startup] Binding to port...");
const PORT = Number(process.env.PORT) || 10000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening on ${PORT}`);
    
    // Database bootstrap moved after server.listen()
    console.log("[Startup] Initializing Prisma database connection...");
    prisma.$connect()
      .then(() => {
        console.log("[Startup] Prisma connected successfully.");
        console.log("[Startup] Bootstrapping database...");
        return bootstrapDatabase();
      })
      .then(() => console.log("[Startup] Database bootstrap completed successfully."))
      .catch((error) => console.error("[Startup] Database initialization failed:", error));
});
