import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./route/user.route.js";
import cors from "cors";
import logger from "morgan";
import optionRoutes from "./route/option.route.js";
import productRoute from "./route/product.route.js";

import {
  getProductQuantities,
  getSuggestions,
  getFoodItemById,
  getFoodItemByBarcode,
} from "./controller/product.controller.js";

import {
  getIngredientByName,
  searchIngredients,
} from "./controller/ingredient.controller.js";

import { testProductAgainstProfile } from "./controller/test.controller.js";

import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
const URI = process.env.AtlasURI;

// ============================================================
// CONNECT TO MONGODB
// ============================================================

try {
  await mongoose.connect(URI);
  console.log("Connected to MongoDB");
} catch (error) {
  console.log("MongoDB Error:", error);
}

// ============================================================
// ROUTES
// ============================================================

// User routes
app.use("/user", userRoute);

// Options routes
app.use("/options", optionRoutes);

// Product routes
// Example:
// GET /select/result/:id
app.use("/select", productRoute);

// ============================================================
// INGREDIENT API
// ============================================================

// IMPORTANT:
// This is an API endpoint.
// It searches MongoDB for the ingredient and returns its details.
//
// Example:
// GET /ingredient/Refined%20Wheat%20Flour
//
// It DOES NOT open a new frontend page.

app.get("/ingredient/:name", getIngredientByName);

// Search ingredients
// Example:
// GET /search/ingredients?query=wheat
app.use("/search", searchIngredients);

// Test product against user profile
app.use("/test/:id", testProductAgainstProfile);

// ============================================================
// PRODUCTION DEPLOYMENT
// ============================================================

if (process.env.NODE_ENV === "production") {
  const dirPath = path.resolve();

  app.use(express.static("./front/dist"));

  // Frontend route for test page
  app.get("/test/:id", (req, res) => {
    res.sendFile(
      path.resolve(
        dirPath,
        "./front/dist",
        "index.html"
      )
    );
  });
}

// ============================================================
// LOGGER
// ============================================================

app.use(logger("tiny"));

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});