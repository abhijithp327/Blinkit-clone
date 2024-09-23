import { Customer, DeliveryPartner } from "../../models/user.js";


export const updateUser = async (req, reply) => {
    try {
        const { userId } = req.user;

        const updateData = req.body;

        let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

        // If no user is found, return early
        if (!user) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "User not found",
            });
        }

        let userModel;

        // Check the role and fetch the user accordingly
        if (user.role === 'Customer') {
            userModel = Customer
        } else if (user.role === 'DeliveryPartner') {
            userModel = DeliveryPartner
        } else {
            // If the role is invalid, return early
            return reply.code(403).send({
                status: 403,
                success: false,
                message: "Invalid user Role",
            });
        };

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "User not found or not updated",
            });
        }

        // If the user is found, return the user data
        return reply.code(200).send({
            status: 200,
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        // If there is an error, log it and return the error response
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to update user",
            error: error,
        });
    }
};
