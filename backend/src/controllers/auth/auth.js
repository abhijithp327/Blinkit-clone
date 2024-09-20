import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from 'jsonwebtoken';
import dotEnv from 'dotenv';


dotEnv.config();

// Tokens
const generateToken = (user) => {
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    return { accessToken, refreshToken };
};

// Login
export const loginCustomer = async (req, reply) => {

    try {

        const { phone } = req.body;

        let customer = await Customer.findOne({ phone });

        if (!customer) {
            customer = new Customer({
                phone,
                role: 'Customer',
                isActivated: true
            });

            await customer.save();
        };

        if (!customer.isActivated) {
            return reply.code(401).send({
                status: 401,
                success: false,
                message: "Customer is not activated",
            });
        };

        const { accessToken, refreshToken } = generateToken(customer)

        return reply.code(200).send({
            status: 200,
            success: true,
            message: customer ? "Login successful" : "Customer created and logged in successful",
            accessToken,
            refreshToken,
            customer
        });

    } catch (error) {
        console.log(error);
        reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to login",
            error: error
        });
    }
};

export const loginDeliveryPartner = async (req, reply) => {

    try {

        const { email, password } = req.body;

        const deliveryPartner = await DeliveryPartner.findOne({ email });

        if (!deliveryPartner) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Delivery partner no found",
            });
        };

        if (!deliveryPartner.isActivated) {
            return reply.code(401).send({
                status: 401,
                success: false,
                message: "Delivery partner is not activated",
            });
        };

        const isMatchPassword = password === deliveryPartner.password

        if (!isMatchPassword) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Invalid Credentials",
            });
        };

        const { accessToken, refreshToken } = generateToken(deliveryPartner)

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            deliveryPartner
        });

    } catch (error) {
        console.log(error);
        reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to login",
            error: error
        });
    }
};

export const refreshToken = async (req, reply) => {
    try {
        const { refreshToken } = req.body;

        // Check if refresh token is provided
        if (!refreshToken) {
            return reply.code(401).send({
                message: "Refresh token is required"
            });
        }

        // Verify the refresh token using the secret
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        let user;

        // Find user based on the role (Customer or DeliveryPartner)
        if (decoded.role === 'Customer') {
            user = await Customer.findById(decoded.userId);
        } else if (decoded.role === 'DeliveryPartner') {
            user = await DeliveryPartner.findById(decoded.userId);
        } else {
            // Invalid role in the token
            return reply.code(403).send({
                message: "Invalid role"
            });
        }

        // If the user is not found, send a 404 response
        if (!user) {
            return reply.code(404).send({
                message: "User not found for the provided refresh token"
            });
        }

        // Generate new access token and refresh token
        const { accessToken, refreshToken: newRefreshToken } = generateToken(user);

        // Send the new tokens back to the client
        return reply.code(200).send({
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.log(error);

        // Check for specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return reply.code(401).send({
                message: "Refresh token has expired"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return reply.code(401).send({
                message: "Invalid refresh token signature"
            });
        }

        // Other errors
        return reply.code(500).send({
            message: "Error verifying refresh token",
            error: error.message
        });
    }
};




export const fetchUser = async (req, reply) => {
    try {
        const { userId, role } = req.user;
        let user;

        // Check the role and fetch the user accordingly
        if (role === 'Customer') {
            user = await Customer.findById(userId);
        } else if (role === 'DeliveryPartner') {
            user = await DeliveryPartner.findById(userId);
        } else {
            // If the role is invalid, return early
            return reply.code(403).send({
                status: 403,
                success: false,
                message: "Invalid Role",
            });
        }

        // If no user is found, return early
        if (!user) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Invalid refresh token, User not found",
            });
        }

        // If the user is found, return the user data
        return reply.code(200).send({
            status: 200,
            success: true,
            message: "User fetched successfully",
            user,
        });

    } catch (error) {
        // If there is an error, log it and return the error response
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to fetch user",
            error: error.message,  // Return the error message for clarity
        });
    }
};
