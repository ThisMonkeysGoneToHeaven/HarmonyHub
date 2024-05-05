import mongoose,{ConnectOptions} from 'mongoose';

// DO THIS
// const uri = process.env.DB_SERVER_PATH;
const uri = `mongodb://localhost:27017/HarmonyHub`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export default db;