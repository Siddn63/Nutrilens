import FoodItem from '../model/product.model.js';
import User from '../model/user.model.js';
import Ingredient from '../model/ingredient.model.js';

export const testProductAgainstProfile = async (req, res) => {
  const { id } = req.params;
  const { userId, quantity } = req.query;

  try {
    const product = await FoodItem.findById(id);
    const user = await User.findById(userId);

    if (!product || !user) {
      return res.status(404).json({ error: 'Product or User not found' });
    }

    // Normalize to lowercase for case-insensitive comparison
    const userAllergies = (user.allergies || []).map(a => a.toLowerCase());
    const userPreconditions = (user.preconditions || []).map(p => p.toLowerCase());

    const ingredientNames = product.ingredients || [];
    const ingredientNamesLower = ingredientNames.map(i => i.toLowerCase());
    const allergens = product.allergens || [];
    const allergyInfoLower = allergens.map(a => a.toLowerCase());

    const matched_allergies = [
      ...new Set([
        ...allergens.filter(item => userAllergies.includes(item.toLowerCase())),
        ...ingredientNames.filter(ingredient => userAllergies.includes(ingredient.toLowerCase()))
      ])
    ];

    const ingredientDocs = await Ingredient.find({
      name: { $in: ingredientNames }
    });

    const matched_preconditions = [];
    ingredientDocs.forEach(ingredient => {
      const restricted = (ingredient.restrictedFor || []).map(r => r.toLowerCase());
      restricted.forEach(precondition => {
        if (
          userPreconditions.includes(precondition) &&
          !matched_preconditions.includes(precondition)
        ) {
          matched_preconditions.push(precondition);
        }
      });
    });

    let veg_match = false;
    if ((user.vegNonVeg || '').toLowerCase() === 'veg') {
      veg_match = (product.vegNonVeg || '').toLowerCase() === 'veg';
    } else {
      veg_match = true;
    }

    res.json({
      matched_allergies,
      matched_preconditions,
      veg_match,
      selected_quantity: quantity
    });

  } catch (err) {
    console.error('Test error:', err);
    res.status(500).json({ error: 'Server error during testing' });
  }
};