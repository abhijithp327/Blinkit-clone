import Branch from "../../models/branch.js";
import Order from "../../models/order.js";
import { Customer, DeliveryPartner } from "../../models/user.js";



export const createOrder = async (req, reply) => {

    try {

        const { userId } = req.user;

        const { items, branch, totalPrice } = req.body;

        const customerData = await Customer.findById(userId);

        const branchData = await Branch.findById(branch);

        if (!customerData) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Customer not found",
            });
        };

        if (!branchData) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Branch not found",
            });
        };

        const newOrder = new Order({
            customer: userId,
            items: items?.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || 'No address available',
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || 'No address available',
            },
        });

        const savedOrder = await newOrder.save();

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Order created successfully",
            savedOrder
        });

    } catch (error) {
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to create order",
            error: error
        });
    }
};


export const confirmOrder = async (req, reply) => {

    try {

        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation } = req.body;

        const deliveryPerson = await DeliveryPartner.findById(userId);

        if (!deliveryPerson) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Delivery person not found",
            });
        };

        const order = await Order.findById(orderId);

        if (!order) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Order not found",
            });
        };

        if (order.status !== 'available') {
            return reply.code(400).send({
                status: 400,
                success: false,
                message: "Order is not available",
            });
        };

        order.status = 'confirmed';

        order.deliveryPartner = userId;

        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation?.address || ''
        };

        req.server.io.to(orderId).emit('orderConfirmed', order);

        await order.save();

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Order confirmed successfully",
            order
        });

    } catch (error) {
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to confirm order",
            error: error
        });
    }
};

export const updateOrderStatus = async (req, reply) => {

    try {

        const { orderId } = req.params;

        const { status, deliveryPersonLocation } = req.body;

        const { userId } = req.user;

        const deliveryPerson = await DeliveryPartner.findById(userId);

        if (!deliveryPerson) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Delivery person not found",
            });
        };

        const order = await Order.findById(orderId);

        if (!order) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Order not found",
            });
        };

        if (['cancelled', 'delivered'].includes(order.status)) {
            return reply.code(400).send({
                status: 400,
                success: false,
                message: "Order is already cancelled or delivered",
            });
        };

        if (order.deliveryPartner.toString() !== userId) {
            return reply.code(403).send({
                status: 403,
                success: false,
                message: "You are not authorized to cancel this order",
            })
        }

        order.status = status;

        order.deliveryPersonLocation = deliveryPersonLocation;

        await order.save();

        req.server.io.to(orderId).emit('liveTrackingUpdates', order);

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to update order status",
        });
    }
};


export const getOrders = async (req, reply) => {

    try {

        const { status, customerId, deliveryPartnerId, branchId } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        };

        if (customerId) {
            query.customer = customerId;
        };

        if (deliveryPartnerId) {
            query.deliveryPartner = deliveryPartnerId;
            query.branch = branchId;
        };

        const orders = await Order.find(query).populate(
            "customer branch deliveryPartner",
        );

        if (!orders) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Orders not found",
            });
        };

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Orders fetched successfully",
            orders
        });

    } catch (error) {
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to fetch orders",
        });
    }
};



export const getOrderById = async (req, reply) => {

    try {

        const { orderId } = req.params;

        const orders = await Order.findById(orderId).populate(
            "customer branch deliveryPartner",
        );

        if (!orders) {
            return reply.code(404).send({
                status: 404,
                success: false,
                message: "Orders not found",
            });
        };

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Orders fetched successfully",
            orders
        });

    } catch (error) {
        console.log(error);
        return reply.code(500).send({
            status: 500,
            success: false,
            message: "Failed to fetch orders",
        });
    }
};


