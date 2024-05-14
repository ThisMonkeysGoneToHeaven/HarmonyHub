import { config } from 'dotenv';
config();

const fs = require('fs');
import express from 'express';
const https = require('https');
import authRouter from './routes/authRouter';
import userRouter from './routes/userRouter';
import spotifyRouter from './routes/spotifyRouter';


// Import the database connection from db.ts
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;


// self signed certificate credentials
const privateKey = fs.readFileSync('./cert/key.pem', 'utf8');
const certificate = fs.readFileSync('./cert/cert.pem', 'utf8');

const httpsServer = https.createServer({key: privateKey, cert: certificate}, app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER_URI),
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
app.use(express.json());
app.use('/auth', authRouter);
app.use('/api/spotify', spotifyRouter);
app.use('/api/user', userRouter);

httpsServer.listen(port, () => {
    console.log(`Server is running on ${port}`);
});