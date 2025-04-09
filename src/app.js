import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger from './config/logger.js';
import { errorConverter, errorHandler } from './middlewares/errorMiddleware.js';
import { authRouter as authRoutes } from './routes/authRoutes.js';
const app = express();
  
// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  // In your controller:
  console.log('Request body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;