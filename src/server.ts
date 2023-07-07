import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import feedRoutes from './routes/feedRoutes';
import morgan from 'morgan';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.use('/users', userRoutes);
app.use('/feeds', feedRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).send({ message: err.message });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
