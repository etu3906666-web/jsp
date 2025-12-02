import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import scheduleRoutes from "./routes/schedule.js";
import recordRoutes from "./routes/record.js";
import familyRoutes from "./routes/family.js";

const app = express();

app.use(express.json());

// API 라우팅
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/record", recordRoutes);
app.use("/api/family", familyRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
