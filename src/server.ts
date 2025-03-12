import express from 'express';
import db from './config/connection.js';
import mongoose from 'mongoose';
import routes from './routes/index.js';
// import dotenv from 'dotenv';
// dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialNetworkAPI';  // Use the DB URI from .env


const cwd = process.cwd();
const PORT = 3001;
const app = express();

// Optional: Display activity in terminal based on the current directory
const activity = cwd.includes('01-Activities')
  ? cwd.split('01-Activities')[1]
  : cwd;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);
mongoose.connect(MONGODB_URI).then(() => {
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server for ${activity} running on port ${PORT}!`);
    });
  });
});
