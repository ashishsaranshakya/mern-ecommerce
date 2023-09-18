import dotenv from 'dotenv';
dotenv.config();

import https from 'https';
import fs from 'fs';
import app from './app.js';
import { mongoConnect } from './services/mongo.js';

/* HTTPS SETUP */
const privateKey = fs.readFileSync('./certs/key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

const startServer = async () => {
    await mongoConnect();
    httpsServer.listen(process.env.PORT, () => {
        console.log(`Server running on port: ${process.env.PORT}`)
    });
}

startServer();