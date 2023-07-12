import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import feedRoutes from './routes/feedRoutes';
import commentRoutes from './routes/commentRoutes';
import morgan from 'morgan';
import cors from './config/cors';
import sendErrorResponse from './utils/sendErrorResponse';
import { authMiddleware } from './middleware/authentication';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors);

app.use('/users', userRoutes);
app.use('/feeds', feedRoutes);
app.use('/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Add the new endpoint
app.get('/current_user', authMiddleware, (req, res) => {
  res.send(res.locals.user); // Send back the user data
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  sendErrorResponse(res, err.status || 500, err.message);
  return;
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
