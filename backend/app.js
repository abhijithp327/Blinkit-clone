import Fastify from 'fastify';
import { connectDB } from './src/config/dbConnect.js';
import dotenv from 'dotenv';


dotenv.config();



const start = async () => {

    await connectDB(process.env.MONGO_URI);

    const app = Fastify();
    const PORT = process.env.PORT || 5000;
    app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Blinkit started on http://localhost:${PORT}`);
        }
    });
};

start();