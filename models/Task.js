import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Status must be either 'pending' or 'completed'",
      },
      default: "pending",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
