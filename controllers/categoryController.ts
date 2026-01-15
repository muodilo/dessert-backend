import { RequestHandler } from 'express';
import Category from '../models/categoryModel';
import { AppError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Bad request - missing fields
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Internal server error
 */
export const createCategory: RequestHandler = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name || !description) {
      throw new AppError("Name and description are required", 400);
    }

    // Check if category already exists (case-insensitive)
    const categoryExists = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (categoryExists) {
      throw new AppError("Category already exists", 409);
    }

    // Create category
    const category = await Category.create({
      name: name.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       500:
 *         description: Internal server error
 */
export const getAllCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const getCategoryById: RequestHandler = async (req, res, next) => {
  try {
    if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update category by ID (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New category name
 *               description:
 *                 type: string
 *                 description: New category description
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       500:
 *         description: Internal server error
 */
export const updateCategory: RequestHandler = async (req, res, next) => {
  try {
    if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError("Invalid category ID", 400);
    }

    const { name, description } = req.body;

    // Find category
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const nameExists = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id },
      });

      if (nameExists) {
        throw new AppError("Category name already exists", 409);
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description) category.description = description.trim();

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category by ID (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const deleteCategory: RequestHandler = async (req, res, next) => {
  try {
    if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};