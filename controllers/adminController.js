import Task from "../models/Task.js";
import User from "../models/User.js";
import { notFound } from "../utils/httpError.js";
import { isValidObjectId } from "../utils/validation.js";

export const listUsers = async (req, res, next) => {
  try {
    const [users, counts] = await Promise.all([
      User.find().sort({ role: 1, createdAt: 1 }),
      Task.aggregate([
        {
          $group: {
            _id: "$user",
            total: { $sum: 1 },
            completed: { $sum: { $cond: ["$completed", 1, 0] } },
          },
        },
      ]),
    ]);

    const countById = new Map(
      counts.map((entry) => [String(entry._id), entry])
    );

    const result = users.map((user) => {
      const stats = countById.get(String(user._id));
      return {
        ...user.toJSON(),
        taskCount: stats?.total ?? 0,
        completedCount: stats?.completed ?? 0,
      };
    });

    res.status(200).json({ users: result });
  } catch (error) {
    next(error);
  }
};

export const listUserTasks = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      throw notFound("User not found.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw notFound("User not found.");
    }

    const tasks = await Task.find({ user: user._id }).sort({ createdAt: -1 });

    res.status(200).json({ user: user.toJSON(), tasks });
  } catch (error) {
    next(error);
  }
};
