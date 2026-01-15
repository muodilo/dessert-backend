import express from "express";
import { Router } from "express";

import { RegisterUser ,LoginUser,GetUserProfile, UpdateUserProfile, ChangePassword, DeleteUser, GetAllUsers, UpdateUser} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { admin } from "../middleware/adminMiddleware";

const router: Router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.get("/profile/:id", protect, GetUserProfile);
router.put("/profile", protect, UpdateUserProfile);
router.put("/change-password", protect, ChangePassword);
router.delete("/:id", protect, DeleteUser);

// Admin only routes
router.get("/", protect, admin, GetAllUsers);
router.put("/:id", protect, admin, UpdateUser);

export default router;