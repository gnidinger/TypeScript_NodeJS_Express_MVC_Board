import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import feedRoutes from './routes/feedRoutes';
import commentRoutes from './routes/commentRoutes';
import morgan from 'morgan';
import sendErrorResponse from './utils/sendErrorResponse';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.use('/users', userRoutes);
app.use('/feeds', feedRoutes);
app.use('/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  sendErrorResponse(res, err.status || 500, err.message);
  return;
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
