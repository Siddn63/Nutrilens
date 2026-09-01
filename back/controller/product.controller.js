
import sharp from 'sharp';
import FoodItem from '../model/product.model.js';

import pkg from '@zxing/library';
const {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
} = pkg;

const decodeBarcode = async (imageBuffer) => {
  try {
    const { data, info } = await sharp(imageBuffer)
      .resize(400, 400, { fit: 'inside' })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const luminanceSource = new RGBLuminanceSource(data, info.width, info.height);
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    const reader = new MultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);

    reader.setHints(hints);
    const result = reader.decode(binaryBitmap);

    return result?.getText() || null;
  } catch {
    return null;
  }
};

const scanBarcodeFromImage = async (req, res) => {
  try {
if (!req.file) {
  return res.status(400).json({
    error: "Please upload an image.",
  });
}

const barcode = await decodeBarcode(req.file.buffer);

    if (!barcode) {
      return res.status(400).json({ error: 'No barcode found in image' });
    }

    res.json({ barcode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSuggestions = async (req, res) => {
  try {
const query = (req.query.query || '').trim();

    const suggestions = await FoodItem.find({
      name: { $regex: query, $options: 'i' },
    }).select('name _id available_quantities');

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductQuantities = async (req, res) => {
  try {
    const productName = req.query.name;

    if (!productName) {
      return res.status(400).json({
        error: "Product name is required",
      });
    }

    const foodItem = await FoodItem.findOne({
      name: productName,
    }).select("available_quantities");

    if (!foodItem) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(foodItem.available_quantities);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getFoodItemByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const foodItem = await FoodItem.findOne({ barcode });

    if (!foodItem) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  scanBarcodeFromImage,
  getAllFoodItems,
  getFoodItemById,
  getSuggestions,
  getProductQuantities,
  getFoodItemByBarcode,
};