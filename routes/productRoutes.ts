import express, { Router } from 'express';
import { CreateProduct, GetAllProducts, GetProductById, UpdateProduct, DeleteProduct } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';
import { vendorOrAdmin } from '../middleware/adminMiddleware';

const router:Router = express.Router();

// Public routes
router.get('/', GetAllProducts);
router.get('/:id', GetProductById);

// Protected routes (vendor or admin)
router.post('/', protect, vendorOrAdmin, CreateProduct);
router.put('/:id', protect, vendorOrAdmin, UpdateProduct);
router.delete('/:id', protect, vendorOrAdmin, DeleteProduct);

export default router;