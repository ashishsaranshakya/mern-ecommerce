import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { mongoConnect } from './services/mongo.js';

app.listen(process.env.PORT|3000, async () => {
    await mongoConnect();
    console.log(`Server running on port: ${process.env.PORT|3000}`)
})