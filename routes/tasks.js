import express from "express";

import {
  getTasks,
  createTask,
  toggleTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.route("/").get(getTasks).post(createTask);

router.route("/:id").patch(toggleTaskStatus).delete(deleteTask);

export default router;
