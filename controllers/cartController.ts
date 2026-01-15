import { Request, Response, RequestHandler } from 'express';
import Cart from '../models/cartModel';
import Product from '../models/productModel';

/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Bad request - missing productId or product not found
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
export const AddToCart: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const { productId, quantity } = req.body;
    const userId = req.user!._id;

    if (!productId) {
        res.status(400);
        throw new Error("Please provide productId");
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(400);
        throw new Error("Product does not exist");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({
            userId,
            products: [{ productId, quantity: quantity || 1 }]
        });
    } else {
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if (productIndex > -1) {
            cart.products[productIndex]!.quantity += quantity || 1;
        } else {
            cart.products.push({ productId, quantity: quantity || 1 });
        }
        await cart.save();
    }
    const populatedCart = await Cart.findById(cart._id).populate('products.productId', 'name price description');
    res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        data: populatedCart
    });
};

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart not found (returns empty cart)
 *       500:
 *         description: Internal server error
 */
export const GetCart: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;
    const cart = await Cart.findOne({ userId }).populate('products.productId', 'name price description');
    if (!cart) {
        res.status(200).json({
            success: true,
            data: { userId, products: [] }
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: cart
    });
};

/**
 * @swagger
 * /api/v1/cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartUpdate'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Bad request - missing productId or quantity
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart not found or product not in cart
 *       500:
 *         description: Internal server error
 */
export const UpdateCartItem: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const { productId, quantity } = req.body;
    const userId = req.user!._id;

    if (!productId || quantity === undefined) {
        res.status(400);
        throw new Error("Please provide productId and quantity");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex === -1) {
        res.status(404);
        throw new Error("Product not in cart");
    }

    if (quantity <= 0) {
        cart.products.splice(productIndex, 1);
    } else {
        cart.products[productIndex]!.quantity = quantity;
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('products.productId', 'name price description');
    res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        data: populatedCart
    });
};

/**
 * @swagger
 * /api/v1/cart/remove:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The product ID to remove from cart
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Bad request - missing productId
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart not found or product not in cart
 *       500:
 *         description: Internal server error
 */
export const RemoveFromCart: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const { productId } = req.body;
    const userId = req.user!._id;

    if (!productId) {
        res.status(400);
        throw new Error("Please provide productId");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex === -1) {
        res.status(404);
        throw new Error("Product not in cart");
    }

    cart.products.splice(productIndex, 1);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('products.productId', 'name price description');
    res.status(200).json({
        success: true,
        message: "Product removed from cart successfully",
        data: populatedCart
    });
};

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
export const ClearCart: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.products.splice(0);
    await cart.save();
    res.status(200).json({
        success: true,
        message: "Cart cleared successfully"
    });
};
//     if (!userId || !productId) {
//         res.status(400);
//         throw new Error("Please provide userId and productId");
//     }
//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//         res.status(404);
//         throw new Error("Cart not found");
//     }
//     const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
//     if (productIndex > -1) {
//         cart.products.splice(productIndex, 1);
//         await cart.save();
//     }
//     res.status(200).json(cart);
// };


