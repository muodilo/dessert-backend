import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "../config/db";
import categoryRoutes from "../routes/categoryRoutes";
import productRoutes from "../routes/productRoutes";
import userRoutes from "../routes/userRoutes";
import cartRoutes from "../routes/cartRoutes";
import { errorHandler, notFound } from '../middleware/errorMiddleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "../config/swagger";

dotenv.config();


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.get("/", (_req, res) => {
  res.send("API is running");
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cart", cartRoutes);

app.use(errorHandler);
app.use(notFound);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
