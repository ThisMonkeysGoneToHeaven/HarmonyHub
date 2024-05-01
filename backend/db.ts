import mongoose,{ConnectOptions} from 'mongoose';

const dbname = 'HarmonyHub';
const uri = `mongodb://localhost:27017/${dbname}`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export default db;