import Task from "../models/Task.js";
import { badRequest, notFound, HttpError } from "../utils/httpError.js";
import {
  cleanText,
  isDateString,
  isTimeString,
  isValidObjectId,
} from "../utils/validation.js";

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;

const readTitle = (value) => {
  const title = cleanText(value, MAX_TITLE);
  if (title === null) {
    throw badRequest("VALIDATION", "Task title cannot exceed 200 characters.");
  }
  if (!title) {
    throw badRequest("VALIDATION", "Task title is required.");
  }
  return title;
};

const readDescription = (value) => {
  if (value === undefined || value === null) return "";
  const description = cleanText(value, MAX_DESCRIPTION);
  if (description === null) {
    throw badRequest(
      "VALIDATION",
      "Task description cannot exceed 2000 characters."
    );
  }
  return description;
};

const resolveDueFields = (body, current = { dueDate: null, dueTime: null }) => {
  const next = {
    dueDate: current.dueDate ?? null,
    dueTime: current.dueTime ?? null,
  };

  if (Object.hasOwn(body, "dueDate")) {
    const raw = body.dueDate;
    if (raw === null || raw === undefined || raw === "") {
      next.dueDate = null;
    } else if (isDateString(raw)) {
      next.dueDate = raw;
    } else {
      throw badRequest("VALIDATION", "Due date must be a valid date.");
    }
  }

  if (Object.hasOwn(body, "dueTime")) {
    const raw = body.dueTime;
    if (raw === null || raw === undefined || raw === "") {
      next.dueTime = null;
    } else if (isTimeString(raw)) {
      next.dueTime = raw;
    } else {
      throw badRequest("VALIDATION", "Due time must be a valid time.");
    }
  }

  if (next.dueTime && !next.dueDate) {
    throw badRequest("VALIDATION", "A due time requires a due date.");
  }

  if (!next.dueDate) {
    next.dueDate = null;
    next.dueTime = null;
  }

  return next;
};

const loadOwnedTask = async (req) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw notFound("Task not found.");
  }

  const task = await Task.findOne({ _id: id, user: req.user._id });
  if (!task) {
    throw notFound("Task not found.");
  }

  return task;
};

const findSubtask = (task, subtaskId) => {
  if (!isValidObjectId(subtaskId)) {
    throw notFound("Subtask not found.");
  }
  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw notFound("Subtask not found.");
  }
  return subtask;
};

export const listTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await loadOwnedTask(req);
    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const title = readTitle(body.title);
    const description = readDescription(body.description);
    const { dueDate, dueTime } = resolveDueFields(body);

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      dueTime,
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const task = await loadOwnedTask(req);

    if (Object.hasOwn(body, "title")) {
      task.title = readTitle(body.title);
    }

    if (Object.hasOwn(body, "description")) {
      task.description = readDescription(body.description);
    }

    if (Object.hasOwn(body, "dueDate") || Object.hasOwn(body, "dueTime")) {
      const { dueDate, dueTime } = resolveDueFields(body, task);
      task.dueDate = dueDate;
      task.dueTime = dueTime;
    }

    if (Object.hasOwn(body, "completed")) {
      if (typeof body.completed !== "boolean") {
        throw badRequest("VALIDATION", "Completion status must be a boolean.");
      }
      if (body.completed !== task.completed) {
        task.completed = body.completed;
        task.completedAt = body.completed ? new Date() : null;
      }
    }

    await task.save();
    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await loadOwnedTask(req);
    await task.deleteOne();
    res.status(200).json({ id: task.id });
  } catch (error) {
    next(error);
  }
};

export const addSubtask = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const task = await loadOwnedTask(req);
    const title = readTitle(body.title);
    const { dueDate, dueTime } = resolveDueFields(body);

    task.subtasks.push({ title, dueDate, dueTime });
    await task.save();

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateSubtask = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const task = await loadOwnedTask(req);
    const subtask = findSubtask(task, req.params.subtaskId);

    if (Object.hasOwn(body, "title")) {
      subtask.title = readTitle(body.title);
    }

    if (Object.hasOwn(body, "dueDate") || Object.hasOwn(body, "dueTime")) {
      const { dueDate, dueTime } = resolveDueFields(body, subtask);
      subtask.dueDate = dueDate;
      subtask.dueTime = dueTime;
    }

    if (Object.hasOwn(body, "completed")) {
      if (typeof body.completed !== "boolean") {
        throw new HttpError(
          400,
          "VALIDATION",
          "Completion status must be a boolean."
        );
      }
      if (body.completed !== subtask.completed) {
        subtask.completed = body.completed;
        subtask.completedAt = body.completed ? new Date() : null;
      }
    }

    await task.save();
    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteSubtask = async (req, res, next) => {
  try {
    const task = await loadOwnedTask(req);
    const subtask = findSubtask(task, req.params.subtaskId);
    subtask.deleteOne();
    await task.save();
    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};
