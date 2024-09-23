import Product  from "../../models/product.js";


export const getAllProducts = async (req, reply) => {
    try {

        const products = await Product.find();

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "products fetched successfully",
            products
        })

    } catch (error) {
        console.log(error);
        return reply.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch products",
            error: error
        });
    }
};


export const getProductsByCategoryId = async (req, reply) => {
    try {

        const { categoryId } = req.params;

        const products = await Product.find({ category: categoryId })
            .select("-category")
            .exec();

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "products fetched successfully",
            products
        });

    } catch (error) {
        console.log(error);
        return reply.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch products",
            error: error
        });
    }
};