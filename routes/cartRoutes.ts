import express, { Router } from "express";
import { AddToCart, GetCart, UpdateCartItem, RemoveFromCart, ClearCart } from "../controllers/cartController";
import { protect } from "../middleware/authMiddleware";

const router:Router = express.Router();

// All cart routes are protected
router.get('/', protect, GetCart);
router.post('/add', protect, AddToCart);
router.put('/update', protect, UpdateCartItem);
router.delete('/remove', protect, RemoveFromCart);
router.delete('/clear', protect, ClearCart);

export default router;