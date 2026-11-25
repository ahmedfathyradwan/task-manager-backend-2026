import mongoose from "mongoose";
import Task from "../models/Task.js";

const isValidObjectId = (id) => mongoose.isObjectIdOrHexString(id);

// GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ date: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({ title: title.trim() });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id
export const toggleTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = task.status === "completed" ? "pending" : "completed";

    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      id: task.id,
    });
  } catch (error) {
    next(error);
  }
};
