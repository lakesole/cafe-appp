import express from "express";
import cors from "cors";
import path from "path";
import categoryRoutes from "./routes/admin/category.routes";
import menuRoutes from "./routes/admin/menu.routes";
import customerCategoryRoutes from "./routes/customer/category.routes";
import customerMenuRoutes from "./routes/customer/menu.routes";
import customerAuthRoutes from "./routes/customer/auth.routes";
import customerOrderRoutes from "./routes/customer/order.routes";
import customerPaymentRoutes from "./routes/customer/payment.routes";
import customerQuestionRoutes from "./routes/customer/question.routes";
import staffOrderRoutes from "./routes/staff/order.routes";
import adminStaffRoutes from "./routes/admin/staff.routes";
import adminStatsRoutes from "./routes/admin/stats.routes";
import adminQuestionRoutes from "./routes/admin/question.routes";
import { authenticate, requireRole } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", customerAuthRoutes);
app.use("/api/categories", customerCategoryRoutes);
app.use("/api/menu-items", customerMenuRoutes);
app.use("/api/orders", customerOrderRoutes);
app.use("/api/payments", customerPaymentRoutes);
app.use("/api/questions", customerQuestionRoutes);
app.use("/api/staff/orders", staffOrderRoutes);

app.use("/api/admin", authenticate, requireRole("ADMIN"));
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/menu-items", menuRoutes);
app.use("/api/admin/staff", adminStaffRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/questions", adminQuestionRoutes);

const clientDir = path.join(__dirname, "..", "..", "client");
app.use(express.static(clientDir, { extensions: ["html"] }));

app.use(errorHandler);

export default app;
