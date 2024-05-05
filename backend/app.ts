import express from 'express';
import authRouter from './routes/authRouter';
import spotifyRouter from './routes/spotifyRouter';
import userRouter from './routes/userRouter';
import { config } from 'dotenv';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER_URI),
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
app.use(express.json());
app.use('/auth', authRouter);
app.use('/api/spotify', spotifyRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});