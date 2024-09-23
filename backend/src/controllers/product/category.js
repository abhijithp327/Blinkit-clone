import Category  from "../../models/category.js";

export const getAllCategories = async (req, reply) => {
    try {

        const categories = await Category.find();

        return reply.code(200).send({
            status: 200,
            success: true,
            message: "Categories fetched successfully",
            categories
        })

    } catch (error) {
        console.log(error);
        return reply.status(500).json({
            status: 500,
            success: false,
            message: "Failed to fetch categories",
            error: error
        });
    }
};