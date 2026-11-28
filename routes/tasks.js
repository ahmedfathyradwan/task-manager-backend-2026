import express from "express";
import {
  addSubtask,
  createTask,
  deleteSubtask,
  deleteTask,
  getTask,
  listTasks,
  updateSubtask,
  updateTask,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(listTasks).post(createTask);
router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);

router.route("/:id/subtasks").post(addSubtask);
router
  .route("/:id/subtasks/:subtaskId")
  .patch(updateSubtask)
  .delete(deleteSubtask);

export default router;
