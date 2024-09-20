import jwt from 'jsonwebtoken';
import dotEnv from 'dotenv';

dotEnv.config();

export const verifyToken = async (req, reply) => {
    try {

        const authHeader = req.headers["authorization"]

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({
                status: 401,
                success: false,
                message: "Access token required",
            });
        };

        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;

        return true;

    } catch (error) {
        console.log(error);
        reply.code(403).send({
            status: 403,
            success: false,
            message: "Invalid or expired token",
            error: error
        });
    }
};