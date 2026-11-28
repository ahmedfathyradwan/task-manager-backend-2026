import express from "express";
import { listUsers, listUserTasks } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/users", listUsers);
router.get("/users/:userId/tasks", listUserTasks);

export default router;
