import express from "express";
import cors from "cors";
import path from "path";
import categoryRoutes from "./routes/admin/category.routes";
import menuRoutes from "./routes/admin/menu.routes";
import customerCategoryRoutes from "./routes/customer/category.routes";
import customerMenuRoutes from "./routes/customer/menu.routes";
import customerAuthRoutes from "./routes/customer/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", customerAuthRoutes);
app.use("/api/categories", customerCategoryRoutes);
app.use("/api/menu-items", customerMenuRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/menu-items", menuRoutes);

const clientDir = path.join(__dirname, "..", "..", "client");
app.use(express.static(clientDir, { extensions: ["html"] }));

app.use(errorHandler);

export default app;
