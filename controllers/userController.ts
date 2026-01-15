import User from "../models/userModel";
import { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
}


/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - missing fields or user already exists
 *       500:
 *         description: Internal server error
 */
export const RegisterUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password,role } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400);
            throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString())
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - invalid credentials
 *       500:
 *         description: Internal server error
 */
export const LoginUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide email and password");
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400);
            throw new Error("Invalid credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400);
            throw new Error("Invalid credentials");
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString())
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const GetUserProfile: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    try {
        if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400);
            throw new Error("Invalid user ID");
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const UpdateUserProfile: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        const { username, email } = req.body;

        if (username) user.username = username;
        if (email) user.email = email;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id.toString())
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users/change-password:
 *   put:
 *     summary: Change current user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChange'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - invalid current password or missing fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const ChangePassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400);
            throw new Error("Please provide current and new password");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400);
            throw new Error("Current password is incorrect");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const DeleteUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400);
            throw new Error("Invalid user ID");
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Only admin can delete any user, or user can delete themselves
        if (req.user!.role !== 'admin' && req.user!._id.toString() !== userId) {
            res.status(403);
            throw new Error("Not authorized to delete this user");
        }

        await user.deleteOne();
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
export const GetAllUsers: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email
 *               role:
 *                 type: string
 *                 enum: [customer, vendor, admin]
 *                 description: New role
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const UpdateUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.params.id || typeof req.params.id !== 'string' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error("Invalid user ID");
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        const { username, email, role } = req.body;

        if (username) user.username = username;
        if (email) user.email = email;
        if (role && req.user!.role === 'admin') user.role = role;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

