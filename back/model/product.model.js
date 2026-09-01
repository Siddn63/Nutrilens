import mongoose from 'mongoose';

const NutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  { _id: false }
);

const QuantitySchema = new mongoose.Schema(
  {
    quantity: {
      type: String,
      required: true,
    },
    nutrition: {
      type: NutritionSchema,
      required: true,
    },
  },
  { _id: false }
);

const FoodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
   barcode: {
  type: String,
  unique: true,
  trim: true,
},
    vegNonVeg: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      default: 'Veg',
    },
    available_quantities: {
      type: [QuantitySchema],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    side_effects: {
      type: [String],
      default: [],
    },
    harm_level: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    image_url: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FoodItem', FoodItemSchema);