import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
