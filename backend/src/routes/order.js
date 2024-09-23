import { confirmOrder, createOrder, getOrderById, getOrders, updateOrderStatus } from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";


export const orderRoutes = async (fastify, options) => {
    // This hook will check authentication for every request to the order routes
    fastify.addHook('preHandler', async (request, reply) => {

        const isAuthenticated = await verifyToken(request, reply);

        if (!isAuthenticated) {
            return reply.code(401).send({
                status: 401,
                success: false,
                message: "Unauthorized",
            });
        }
    });

    fastify.post('/order', createOrder);
    fastify.get('/order', getOrders);
    fastify.put('/order/:orderId/status', updateOrderStatus);
    fastify.post('/order/:orderId/confirm', confirmOrder);
    fastify.get('/order/:orderId', getOrderById);

};