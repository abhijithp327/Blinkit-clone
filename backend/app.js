import Fastify from 'fastify';
import { connectDB } from './src/config/dbConnect.js';
import dotenv from 'dotenv';
import { PORT } from './src/config/config.js';
import { admin, buildAdminRouter } from './src/config/setup.js';
import { registerRoutes } from './src/routes/index.js';
import fastifySocketIO from 'fastify-socket.io'


dotenv.config();



const start = async () => {

    await connectDB(process.env.MONGO_URI);

    const app = Fastify();

    app.register(fastifySocketIO, {
        cors: {
            origin: '*',
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ['websocket'],
    });

    await registerRoutes(app);

    await buildAdminRouter(app);

    // host: '0.0.0.0'

    app.listen({ port: PORT }, (err, address) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Blinkit started on http://localhost:${PORT}${admin.options.rootPath}`);
        }
    });

    app.ready().then(() => {
        app.io.on('connection', (socket) => {
            console.log('Client connected ✅');

            socket.on("joinRoom", (orderId) => {
                socket.join(orderId);
                console.log(`🔴 Client joined room ${orderId} 🔴`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected ❌');
            });

        });
    });

};

start();