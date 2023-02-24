import mongoose from 'mongoose'


mongoose.connect(process.env.MONGODB_URIE || 'mongodb://127.0.0.1:27017/dataPhotos', {
  useNewUrlParser: true,
  useUnifiedTopology: true

});

const db = mongoose.connection;

export default db



