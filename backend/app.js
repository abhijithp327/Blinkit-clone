import Fastify from 'fastify';
import { connectDB } from './src/config/dbConnect.js';
import dotenv from 'dotenv';
import { PORT } from './src/config/config.js';
import { admin, buildAdminRouter } from './src/config/setup.js';
import { registerRoutes } from './src/routes/index.js';


dotenv.config();



const start = async () => {

    await connectDB(process.env.MONGO_URI);

    const app = Fastify();

    await registerRoutes(app);

    await buildAdminRouter(app);

    app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Blinkit started on http://localhost:${PORT}${admin.options.rootPath}`);
        }
    });
};

start();