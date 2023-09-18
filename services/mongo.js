import mongoose from 'mongoose';

mongoose.connection.once('open', () => {
    console.log('MongoDB connection established successfully');
  });
  
mongoose.connection.on('error', (err) => {
    console.error(err);
});

export const mongoConnect = async () => {
    await mongoose.connect(
        process.env.MONGO_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
}
  
export const mongoDisconnect = async () => {
    await mongoose.disconnect();
}