import mongoose,{ConnectOptions} from 'mongoose';

const uri = process.env.DB_SERVER_PATH!;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export default db;