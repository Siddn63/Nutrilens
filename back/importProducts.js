import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";
import Product from "./model/product.model.js";

dotenv.config();

const csvFilePath =
  "./data/nutrlens_indian_products_2500_with_images.csv";

// ----------------------------------------
// DEFAULT NUTRITION
// ----------------------------------------

const emptyNutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sugar: 0,
  fiber: 0,
  sodium: 0,
};

// ----------------------------------------
// HELPER: SAFE NUMBER
// ----------------------------------------

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

// ----------------------------------------
// HELPER: NORMALIZE NUTRITION
// ----------------------------------------

function normalizeNutrition(value) {
  if (!value || typeof value !== "object") {
    return { ...emptyNutrition };
  }

  return {
    calories: safeNumber(value.calories),
    protein: safeNumber(value.protein),
    carbs: safeNumber(value.carbs),
    fat: safeNumber(value.fat),
    sugar: safeNumber(value.sugar),
    fiber: safeNumber(value.fiber),
    sodium: safeNumber(value.sodium),
  };
}

// ----------------------------------------
// HELPER: PARSE ARRAY FIELDS
// ----------------------------------------

function parseArray(value) {
  if (!value) {
    return [];
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(stringValue);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") {
            return item.trim();
          }

          return item;
        })
        .filter((item) => {
          if (typeof item === "string") {
            return item.length > 0;
          }

          return item !== null && item !== undefined;
        });
    }

    return [];
  } catch {
    return [];
  }
}

// ----------------------------------------
// HELPER: PARSE AVAILABLE QUANTITIES
// ----------------------------------------

function parseAvailableQuantities(value) {
  if (!value) {
    return [];
  }

  let parsedValue;

  try {
    parsedValue = JSON.parse(String(value).trim());
  } catch {
    parsedValue = String(value).trim();
  }

  // ----------------------------------------
  // SINGLE STRING
  // ----------------------------------------

  if (typeof parsedValue === "string") {
    const quantity = parsedValue.trim();

    if (!quantity) {
      return [];
    }

    return [
      {
        quantity,
        nutrition: { ...emptyNutrition },
      },
    ];
  }

  // ----------------------------------------
  // NOT ARRAY
  // ----------------------------------------

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  // ----------------------------------------
  // CONVERT EVERY QUANTITY
  // ----------------------------------------

  return parsedValue
    .map((item) => {
      // ----------------------------------------
      // STRING
      // ----------------------------------------

      if (typeof item === "string") {
        const quantity = item.trim();

        if (!quantity) {
          return null;
        }

        return {
          quantity,
          nutrition: { ...emptyNutrition },
        };
      }

      // ----------------------------------------
      // OBJECT
      // ----------------------------------------

      if (item && typeof item === "object") {
        const quantity =
          item.quantity ??
          item.name ??
          item.size ??
          item.label ??
          item.value ??
          "";

        const cleanQuantity = String(quantity).trim();

        if (!cleanQuantity) {
          return null;
        }

        return {
          quantity: cleanQuantity,
          nutrition: normalizeNutrition(item.nutrition),
        };
      }

      return null;
    })
    .filter(Boolean);
}

// ----------------------------------------
// HELPER: VEG / NON-VEG
// ----------------------------------------

function parseVegNonVeg(value) {
  const vegValue = String(value || "")
    .trim()
    .toLowerCase();

  if (
    vegValue === "non-veg" ||
    vegValue === "nonveg" ||
    vegValue === "non veg"
  ) {
    return "Non-Veg";
  }

  return "Veg";
}

// ----------------------------------------
// HELPER: HARM LEVEL
// ----------------------------------------

function parseHarmLevel(value) {
  const harmValue = String(value || "")
    .trim()
    .toLowerCase();

  if (harmValue === "low") {
    return "Low";
  }

  if (harmValue === "high") {
    return "High";
  }

  return "Medium";
}

// ----------------------------------------
// PRODUCTS ARRAY
// ----------------------------------------

const products = [];

// ----------------------------------------
// READ CSV
// ----------------------------------------

fs.createReadStream(csvFilePath)
  .pipe(
    csv({
      mapHeaders: ({ header }) =>
        header.replace(/^\uFEFF/, "").trim(),
    }),
  )

  // ----------------------------------------
  // EACH ROW
  // ----------------------------------------

  .on("data", (row) => {
    const name = String(row.name || "").trim();

    if (!name) {
      return;
    }

    const availableQuantities = parseAvailableQuantities(
      row.available_quantities,
    );

    const ingredients = parseArray(row.ingredients);

    const allergens = parseArray(row.allergens);

    const sideEffects = parseArray(row.side_effects);

    const vegNonVeg = parseVegNonVeg(row.vegNonVeg);

    const harmLevel = parseHarmLevel(row.harm_level);

    const barcode = String(row.barcode || "").trim();

    // IMPORTANT:
    // Do NOT add product_name here.
    // Your current Mongoose schema uses name.
    products.push({
      name,

      brand: String(row.brand || "").trim(),

      category: String(row.category || "").trim(),

      barcode: barcode || undefined,

      vegNonVeg,

      available_quantities: availableQuantities,

      ingredients,

      allergens,

      side_effects: sideEffects,

      harm_level: harmLevel,

      image_url: String(row.image_url || "").trim(),
    });
  })

  // ----------------------------------------
  // CSV FINISHED
  // ----------------------------------------

  .on("end", async () => {
    try {
      console.log(`CSV loaded: ${products.length} products`);

      if (products.length === 0) {
        console.log("No products were loaded from CSV.");
        process.exit(1);
      }

      // ----------------------------------------
      // REMOVE DUPLICATE PRODUCT NAMES
      // ----------------------------------------

      const uniqueProducts = [];
      const productNames = new Set();

      for (const product of products) {
        const key = product.name.trim().toLowerCase();

        if (!productNames.has(key)) {
          productNames.add(key);
          uniqueProducts.push(product);
        }
      }

      console.log(`Unique products: ${uniqueProducts.length}`);

      // ----------------------------------------
      // SHOW FIRST PRODUCT
      // ----------------------------------------

      console.log(
        "First product:",
        JSON.stringify(uniqueProducts[0], null, 2),
      );

      // ----------------------------------------
      // CONNECT MONGODB
      // ----------------------------------------

      await mongoose.connect(process.env.AtlasURI);

      console.log("MongoDB connected");

      // ----------------------------------------
      // REMOVE OLD BROKEN INDEX
      // ----------------------------------------

      try {
        await Product.collection.dropIndex("product_name_1");

        console.log(
          "Old product_name index removed",
        );
      } catch (error) {
        if (
          error.codeName === "IndexNotFound" ||
          error.code === 27
        ) {
          console.log(
            "Old product_name index not found",
          );
        } else {
          throw error;
        }
      }

      // ----------------------------------------
      // DELETE OLD PRODUCTS
      // ----------------------------------------

      await Product.deleteMany({});

      console.log("Existing products deleted");

      // ----------------------------------------
      // INSERT PRODUCTS
      // ----------------------------------------

      const insertedProducts =
        await Product.insertMany(
          uniqueProducts,
          {
            ordered: true,
          },
        );

      console.log(
        `Successfully imported ${insertedProducts.length} products`,
      );

      // ----------------------------------------
      // DISCONNECT
      // ----------------------------------------

      await mongoose.disconnect();

      console.log("MongoDB disconnected");

      process.exit(0);
    } catch (error) {
      console.error("Import failed:");
      console.error(error);

      // ----------------------------------------
      // SHOW VALIDATION ERRORS
      // ----------------------------------------

      if (error.errors) {
        console.error("\nValidation errors:");

        for (const [field, details] of Object.entries(
          error.errors,
        )) {
          console.error(
            `${field}: ${details.message}`,
          );
        }
      }

      // ----------------------------------------
      // SHOW DUPLICATE KEY ERROR
      // ----------------------------------------

      if (error.code === 11000) {
        console.error("\nDuplicate key error:");

        console.error(error.keyValue);

        console.error(
          "A unique MongoDB index contains a duplicate value.",
        );
      }

      // ----------------------------------------
      // DISCONNECT AFTER ERROR
      // ----------------------------------------

      try {
        await mongoose.disconnect();
      } catch {}

      process.exit(1);
    }
  })

  // ----------------------------------------
  // CSV ERROR
  // ----------------------------------------

  .on("error", (error) => {
    console.error(
      "CSV reading failed:",
      error,
    );

    process.exit(1);
  });