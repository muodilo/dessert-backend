import { Request, Response, RequestHandler } from 'express';
import Category from '../models/categoryModel';
import Product from '../models/productModel';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product (Vendor/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Bad request - missing fields or invalid category
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Vendor or Admin access required
 *       500:
 *         description: Internal server error
 */
export const CreateProduct: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const {name, price, description, categoryId, inStock, quantity} = req.body;
    if(!name || !price || !categoryId){
        res.status(400);
        throw new Error("Please fill all the required fields");
    }
    const category = await Category.findById(categoryId);
    if(!category){
        res.status(400);
        throw new Error("Category does not exist");
    }
    const product = await Product.create({
        name,
        price,
        description,
        categoryId,
        vendorId: req.user!._id,
        inStock,
        quantity
    });
    res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product
    });
};

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       500:
 *         description: Internal server error
 */
export const GetAllProducts: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find({}).populate('categoryId', 'name description').populate('vendorId', 'username');
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error in GetAllProducts:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const GetProductById: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    try {
        if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error("Invalid product ID");
        }
        const product = await Product.findById(req.params.id).populate('categoryId', 'name description').populate('vendorId', 'username');
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update product by ID (Owner/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New product name
 *               price:
 *                 type: number
 *                 description: New product price
 *               description:
 *                 type: string
 *                 description: New product description
 *               categoryId:
 *                 type: string
 *                 description: New category ID
 *               inStock:
 *                 type: boolean
 *                 description: New stock status
 *               quantity:
 *                 type: integer
 *                 description: New quantity
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Invalid product ID or category ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update this product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const UpdateProduct: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    try {
        if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error("Invalid product ID");
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        // Check if user is vendor of this product or admin
        if (req.user!.role !== 'admin' && product.vendorId.toString() !== req.user!._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to update this product");
        }

        const { name, price, description, categoryId, inStock, quantity } = req.body;

        if (name) product.name = name;
        if (price) product.price = price;
        if (description) product.description = description;
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                res.status(400);
                throw new Error("Category does not exist");
            }
            product.categoryId = categoryId;
        }
        if (inStock !== undefined) product.inStock = inStock;
        if (quantity !== undefined) product.quantity = quantity;

        const updatedProduct = await product.save();
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product by ID (Owner/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete this product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const DeleteProduct: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    try {
        if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error("Invalid product ID");
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found");
        }

        // Check if user is vendor of this product or admin
        if (req.user!.role !== 'admin' && product.vendorId.toString() !== req.user!._id.toString()) {
            res.status(403);
            throw new Error("Not authorized to delete this product");
        }

        await product.deleteOne();
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

