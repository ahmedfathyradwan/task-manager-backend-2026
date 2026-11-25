
import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import taskRoutes from "./routes/tasks.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://taskmanager-gzezmdcni-abdelrahman-fathis-projects.vercel.app",
  "https://taskmanager-six-peach-17.vercel.app"
];

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true
  })
);

// Body Parser
app.use(express.json());

// API Routes
app.use("/api/tasks", taskRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
