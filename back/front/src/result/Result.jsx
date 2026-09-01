import React, { useEffect, useRef, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API = 'http://localhost:4000';

const CHART_COLORS = {
  Carbs: '#3b82f6',
  Fat: '#f59e0b',
  Sugar: '#22c55e',
  Protein: '#a855f7',
  Fiber: '#8b5e3c',
  Sodium: '#2dd4bf',
};

const ALLERGEN_ICONS = {
  wheat: '🌾',
  gluten: '🚫',
  milk: '🍼',
  soy: '🌱',
  nuts: '🥜',
  egg: '🥚',
};

function harmColor(level) {
  const l = (level || '').toLowerCase();

  if (l === 'low') return 'text-green-400';

  if (l === 'medium' || l === 'moderate') {
    return 'text-yellow-400';
  }

  if (l === 'high') return 'text-red-400';

  return 'text-gray-300';
}

function harmDot(level) {
  const l = (level || '').toLowerCase();

  if (l === 'high') return 'bg-red-400';

  if (l === 'medium' || l === 'moderate') {
    return 'bg-yellow-400';
  }

  if (l === 'low') return 'bg-green-400';

  return 'bg-gray-400';
}

function nutritionDot(label) {
  switch (label) {
    case 'Calories':
      return 'bg-blue-400';

    case 'Protein':
      return 'bg-purple-400';

    case 'Carbohydrates':
      return 'bg-green-400';

    case 'Fat':
      return 'bg-orange-400';

    case 'Sugar':
      return 'bg-pink-400';

    case 'Fiber':
    case 'Dietary Fiber':
      return 'bg-amber-400';

    case 'Sodium':
      return 'bg-cyan-400';

    default:
      return 'bg-gray-400';
  }
}

function Result() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const selectedQuantity = queryParams.get('quantity') || '';

  const [product, setProduct] = useState(null);

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [ingredientError, setIngredientError] = useState('');

  const ingredientDetailsRef = useRef(null);

  /* =====================================
     FETCH PRODUCT
  ===================================== */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${API}/select/result/${id}?quantity=${selectedQuantity}`
        );

        const data = res.data;

        if (
          (!selectedQuantity ||
            selectedQuantity.trim() === '') &&
          data.available_quantities?.length
        ) {
          const defaultQty =
            data.available_quantities[0].quantity;

          navigate(
            `/result/${id}?quantity=${encodeURIComponent(
              defaultQty
            )}`,
            { replace: true }
          );

          return;
        }

        setProduct(data);
      } catch (error) {
        console.error(
          'Error fetching product:',
          error
        );

        setProduct({});
      }
    };

    fetchProduct();
  }, [id, selectedQuantity, navigate]);

  /* =====================================
     INGREDIENT CLICK
  ===================================== */

  const handleIngredientClick = async (
    ingredientName
  ) => {
    if (!ingredientName) return;

    try {
      setIngredientLoading(true);
      setIngredientError('');

      const encodedName =
        encodeURIComponent(ingredientName);

      const res = await axios.get(
        `${API}/ingredient/${encodedName}`
      );

      const ingredientData = res.data;

      setSelectedIngredient(ingredientData);

      setTimeout(() => {
        ingredientDetailsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (error) {
      console.error(
        'Error fetching ingredient details:',
        error
      );

      setSelectedIngredient(null);

      if (error.response?.status === 404) {
        setIngredientError(
          `No details found in database for "${ingredientName}".`
        );
      } else {
        setIngredientError(
          'Unable to load ingredient details.'
        );
      }
    } finally {
      setIngredientLoading(false);
    }
  };

  /* =====================================
     LOADING
  ===================================== */

  if (!product) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <Navbar fixed={false} />

        <p className="text-white text-lg font-semibold">
          Loading...
        </p>
      </div>
    );
  }

  /* =====================================
     PRODUCT NOT FOUND
  ===================================== */

  if (!product.name) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <Navbar fixed={false} />

        <p className="text-white text-xl font-semibold">
          Product not found.
        </p>
      </div>
    );
  }

  /* =====================================
     PRODUCT DATA
  ===================================== */

  const {
    name,
    brand,
    description,
    category,
    vegNonVeg,
    image_url,
    ingredients = [],
    allergens = [],
    available_quantities = [],
    harm_level,
  } = product;

  const selectedQuantityObject =
    available_quantities.find(
      (q) => q.quantity === selectedQuantity
    ) ||
    available_quantities[0] ||
    {};

  const validImageUrl =
    image_url && image_url.trim() !== ''
      ? image_url
      : '/images/fallback.jpg';

  const isVeg = vegNonVeg === 'Veg';

  const nutritionData =
    selectedQuantityObject.nutrition || {};

  /* =====================================
     INGREDIENT ROWS
  ===================================== */

  const ingredientRows = ingredients.map(
    (ingredient) => {
      if (typeof ingredient === 'string') {
        return {
          name: ingredient,
          amount: null,
        };
      }

      return {
        name: ingredient.name,
        amount: ingredient.amount,
      };
    }
  );

  /* =====================================
     PRODUCT NUTRITION
  ===================================== */

  const summaryRows = [
    {
      label: 'Calories',
      value: nutritionData.calories,
      unit: 'kcal',
      dot: '#3b82f6',
    },
    {
      label: 'Carbohydrates',
      value: nutritionData.carbs,
      unit: 'g',
      dot: '#22c55e',
    },
    {
      label: 'Sugars',
      value: nutritionData.sugar,
      unit: 'g',
      dot: '#f59e0b',
    },
    {
      label: 'Total Fat',
      value: nutritionData.fat,
      unit: 'g',
      dot: '#ef4444',
    },
    {
      label: 'Protein',
      value: nutritionData.protein,
      unit: 'g',
      dot: '#a855f7',
    },
    {
      label: 'Dietary Fiber',
      value: nutritionData.fiber,
      unit: 'g',
      dot: '#8b5e3c',
    },
    {
      label: 'Sodium',
      value: nutritionData.sodium,
      unit: 'mg',
      dot: '#2dd4bf',
    },
  ];

  /* =====================================
     PIE CHART
  ===================================== */

  const chartData = [
    {
      name: 'Carbs',
      value: Number(nutritionData.carbs) || 0,
    },
    {
      name: 'Fat',
      value: Number(nutritionData.fat) || 0,
    },
    {
      name: 'Sugar',
      value: Number(nutritionData.sugar) || 0,
    },
    {
      name: 'Protein',
      value: Number(nutritionData.protein) || 0,
    },
    {
      name: 'Fiber',
      value: Number(nutritionData.fiber) || 0,
    },
  ].filter(
    (item) => item.value > 0
  );

  /* =====================================
     TEST PROFILE
  ===================================== */

  const handleTestClick = () => {
    navigate(
      `/test/${id}?quantity=${encodeURIComponent(
        selectedQuantity
      )}`
    );
  };

  /* =====================================
     INGREDIENT DETAIL DATA
  ===================================== */

  const ingredientNutrition =
    selectedIngredient?.nutrition || {};

  const ingredientSideEffects =
    Array.isArray(
      selectedIngredient?.sideEffects
    )
      ? selectedIngredient.sideEffects
      : [];

  const ingredientRestrictedFor =
    Array.isArray(
      selectedIngredient?.restrictedFor
    )
      ? selectedIngredient.restrictedFor
      : [];

  /* =====================================
     INGREDIENT NUTRITION
  ===================================== */

  const ingredientNutritionRows = [
    {
      label: 'Calories',
      value:
        ingredientNutrition.calories ??
        ingredientNutrition.energy,
      unit: 'kcal',
    },
    {
      label: 'Protein',
      value: ingredientNutrition.protein,
      unit: 'g',
    },
    {
      label: 'Carbohydrates',
      value:
        ingredientNutrition.carbs ??
        ingredientNutrition.carbohydrates,
      unit: 'g',
    },
    {
      label: 'Fat',
      value: ingredientNutrition.fat,
      unit: 'g',
    },
    {
      label: 'Sugar',
      value: ingredientNutrition.sugar,
      unit: 'g',
    },
    {
      label: 'Fiber',
      value:
        ingredientNutrition.fiber ??
        ingredientNutrition.dietaryFiber,
      unit: 'g',
    },
    {
      label: 'Sodium',
      value: ingredientNutrition.sodium,
      unit: 'mg',
    },
  ].filter(
    (row) =>
      row.value !== undefined &&
      row.value !== null &&
      row.value !== ''
  );

  /* =====================================
     FORMAT INGREDIENT NUTRITION
  ===================================== */

  const formatIngredientNutritionValue = (
    value,
    unit
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return `${value} ${unit} / 100 g`;
  };

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24">

      {/* NAVBAR */}

      <Navbar fixed={false} />

      <main className="max-w-6xl mx-auto px-6 pt-8 pb-12">

        {/* =====================================
            PRODUCT HEADER
        ===================================== */}

        <section className="flex flex-col lg:flex-row items-start gap-8 mt-4">

          <div className="flex flex-col gap-4 flex-shrink-0 mt-2">

            <button
              onClick={() => navigate(-1)}
              className="w-fit flex items-center gap-2 border border-gray-700 bg-[#121212] rounded-lg px-4 py-2 text-sm font-medium text-gray-200 hover:border-green-500 hover:text-green-400 hover:bg-[#151a17] transition"
            >
              ← Back
            </button>

            <img
              src={validImageUrl}
              alt={name}
              className="w-40 h-40 rounded-2xl object-cover border border-gray-800"
              onError={(e) => {
                e.currentTarget.src =
                  '/images/fallback.jpg';
              }}
            />

          </div>

          <div className="flex-1 flex flex-col gap-2">

            <div className="flex items-start justify-between gap-4">

              <h1 className="text-3xl font-bold">
                {name}
              </h1>

              <button
                onClick={handleTestClick}
                className="hidden sm:block bg-[#03C755] hover:bg-[#00b544] text-[#06120a] transition rounded-lg px-5 py-2.5 font-semibold shadow-lg shadow-green-700/25"
              >
                Test My Profile
              </button>

            </div>

            {brand && (
              <p className="text-gray-400">
                {brand}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-1">

              {selectedQuantityObject.quantity && (
                <span className="bg-[#1a1a1a] border border-gray-800 text-sm px-3 py-1 rounded-full font-medium">
                  {selectedQuantityObject.quantity}
                </span>
              )}

              {category && (
                <span className="bg-[#1a1a1a] border border-gray-800 text-sm px-3 py-1 rounded-full font-medium">
                  {category}
                </span>
              )}

              <span className="flex items-center gap-1.5 bg-[#1a1a1a] border border-gray-800 text-sm px-3 py-1 rounded-full font-medium">

                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isVeg
                      ? 'bg-green-400'
                      : 'bg-red-400'
                  }`}
                />

                {isVeg
                  ? 'Veg'
                  : 'Non-Veg'}

              </span>

            </div>

            {description && (
              <p className="text-gray-400 mt-1">
                {description}
              </p>
            )}

            {harm_level && (
              <p className="mt-1">

                <span className="font-semibold">
                  Harm Level:{' '}
                </span>

                <span
                  className={`font-semibold ${harmColor(
                    harm_level
                  )}`}
                >
                  {harm_level}
                </span>

              </p>
            )}

            <button
              onClick={handleTestClick}
              className="sm:hidden mt-2 bg-[#03C755] hover:bg-[#00b544] text-[#06120a] transition rounded-lg px-5 py-2.5 font-semibold w-fit"
            >
              Test My Profile
            </button>

          </div>

        </section>

        {/* =====================================
            INGREDIENTS + NUTRITION
        ===================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

          {/* INGREDIENTS */}

          <div className="bg-gradient-to-br from-[#121212] to-[#101813] border border-gray-800 hover:border-green-900/70 rounded-2xl p-6 shadow-lg shadow-black/20 transition">

            <div className="flex items-center justify-between gap-3">

              <div>
                <h2 className="text-xl font-semibold">
                  Ingredients
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Click an ingredient to analyze it
                </p>
              </div>

              {selectedQuantityObject.quantity && (
                <span className="shrink-0 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
                  {selectedQuantityObject.quantity}
                </span>
              )}

            </div>

            {ingredientRows.length > 0 ? (

              <table className="w-full mt-5 text-left">

                <thead>

                  <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-gray-800">

                    <th className="pb-3 font-medium">
                      Ingredient
                    </th>

                    {ingredientRows.some(
                      (row) => row.amount != null
                    ) && (
                      <th className="pb-3 font-medium text-right">
                        Amount
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody>

                  {ingredientRows.map(
                    (row, index) => (

                      <tr
                        key={index}
                        className={`border-b border-gray-900 transition ${
                          selectedIngredient?.name ===
                          row.name
                            ? 'bg-green-500/5'
                            : ''
                        }`}
                      >

                        <td className="py-3.5">

                          <button
                            type="button"
                            onClick={() =>
                              handleIngredientClick(
                                row.name
                              )
                            }
                            className="text-green-400 hover:text-green-300 hover:underline text-left cursor-pointer font-medium transition-colors"
                          >
                            {row.name}
                          </button>

                        </td>

                        {row.amount != null && (
                          <td className="py-3.5 text-right text-gray-300 text-sm">
                            {row.amount}
                          </td>
                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            ) : (

              <p className="text-gray-400 mt-5">
                No ingredients information available.
              </p>

            )}

          </div>

          {/* NUTRITION SUMMARY */}

          <div className="bg-gradient-to-br from-[#121212] to-[#111018] border border-gray-800 hover:border-blue-900/60 rounded-2xl p-6 flex flex-col shadow-lg shadow-black/20 transition">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Nutrition Summary
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Per {selectedQuantityObject.quantity || 'serving'}
                </p>

              </div>

              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              </div>

            </div>

            {Object.keys(nutritionData).length > 0 ? (

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-5">

                <ul className="flex-1 w-full space-y-2.5">

                  {summaryRows
                    .filter(
                      (row) =>
                        row.value !== undefined &&
                        row.value !== null
                    )
                    .map((row) => (

                      <li
                        key={row.label}
                        className="flex items-center justify-between text-gray-300"
                      >

                        <span className="flex items-center gap-2">

                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                row.dot,
                            }}
                          />

                          {row.label}

                        </span>

                        <span className="font-semibold text-white">
                          {row.value} {row.unit}
                        </span>

                      </li>

                    ))}

                </ul>

                {chartData.length > 0 && (

                  <div className="w-40 h-40 flex-shrink-0">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={38}
                          paddingAngle={2}
                        >

                          {chartData.map(
                            (entry) => (

                              <Cell
                                key={entry.name}
                                fill={
                                  CHART_COLORS[
                                    entry.name
                                  ]
                                }
                              />

                            )
                          )}

                        </Pie>

                        <Tooltip
                          formatter={(
                            value,
                            chartName
                          ) => [
                            `${value}`,
                            chartName,
                          ]}
                          contentStyle={{
                            background:
                              '#18181b',
                            border:
                              '1px solid #333',
                            color: '#fff',
                            borderRadius:
                              '10px',
                          }}
                        />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                )}

              </div>

            ) : (

              <p className="text-gray-400 mt-5">
                Nutrition information not available
                for this quantity.
              </p>

            )}

            <p className="text-gray-500 text-xs mt-4">
              ⓘ Nutritional values are approximate
              and may vary slightly.
            </p>

          </div>

        </section>

        {/* =====================================
            ALLERGENS
        ===================================== */}

        <section className="bg-gradient-to-br from-[#121212] to-[#161112] border border-gray-800 rounded-2xl p-6 mt-6 shadow-lg shadow-black/20">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              Allergens
            </h2>

            <span className="text-xs text-gray-500">
              Safety information
            </span>

          </div>

          {allergens.length > 0 ? (

            <>
              <div className="flex flex-wrap gap-3 mt-5">

                {allergens.map(
                  (allergen, index) => (

                    <span
                      key={index}
                      className="flex items-center gap-2 bg-red-500/5 border border-red-500/25 text-red-300 px-4 py-1.5 rounded-full text-sm font-medium"
                    >

                      <span aria-hidden="true">
                        {
                          ALLERGEN_ICONS[
                            allergen.toLowerCase()
                          ] || '⚠️'
                        }
                      </span>

                      {allergen}

                    </span>

                  )
                )}

              </div>

              <p className="text-gray-500 text-sm mt-3">
                May contain traces of nuts, soy
                and other allergens.
              </p>
            </>

          ) : (

            <p className="text-gray-400 mt-4">
              No allergen information available.
            </p>

          )}

        </section>

        {/* =====================================
            INGREDIENT ANALYSIS
        ===================================== */}

        {(ingredientLoading ||
          selectedIngredient ||
          ingredientError) && (

          <section
            ref={ingredientDetailsRef}
            className="mt-16 scroll-mt-8"
          >

            {/* =====================================
                SECTION HEADER
            ===================================== */}

            <div className="mb-8">

              <div className="flex items-center gap-3 mb-3">

                <span className="w-8 h-1 rounded-full bg-green-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-400">
                  Ingredient Analysis
                </p>

              </div>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                <div>

                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                    {selectedIngredient?.name ||
                      'Ingredient Details'}
                  </h2>

                  <p className="text-gray-500 text-sm mt-2">
                    Nutritional and safety information
                    for this ingredient.
                  </p>

                </div>

                {selectedIngredient?.category && (

                  <span className="w-fit rounded-full border border-gray-700 bg-[#151718] px-3.5 py-1.5 text-xs font-medium text-gray-300">
                    {selectedIngredient.category}
                  </span>

                )}

              </div>

            </div>

            {/* =====================================
                LOADING
            ===================================== */}

            {ingredientLoading && (

              <div className="bg-[#111313] border border-gray-800 rounded-2xl p-10 text-center">

                <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-green-400 rounded-full animate-spin mb-4" />

                <p className="text-gray-400 text-sm">
                  Loading ingredient details...
                </p>

              </div>

            )}

            {/* =====================================
                ERROR
            ===================================== */}

            {!ingredientLoading &&
              ingredientError && (

                <div className="bg-[#151010] border border-red-900/60 rounded-2xl p-6">

                  <div className="flex items-center gap-3">

                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />

                    <p className="text-red-400 text-sm">
                      {ingredientError}
                    </p>

                  </div>

                </div>

              )}

            {/* =====================================
                DETAILS
            ===================================== */}

            {!ingredientLoading &&
              selectedIngredient && (

                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5">

                  {/* =====================================
                      LEFT CARD
                  ===================================== */}

                  <div className="relative overflow-hidden bg-gradient-to-br from-[#111313] via-[#111514] to-[#0f1110] border border-gray-800 rounded-2xl p-6 md:p-7 shadow-lg shadow-black/20">

                    {/* TOP ACCENT */}

                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-cyan-400 to-transparent" />

                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-green-400/5 blur-3xl pointer-events-none" />

                    {/* HEADER */}

                    <div className="relative flex items-start justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-2 mb-2">

                          <span className="w-2 h-2 rounded-full bg-green-400" />

                          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                            Ingredient
                          </p>

                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          {selectedIngredient.name}
                        </h3>

                      </div>

                      {selectedIngredient.category && (

                        <span className="shrink-0 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5 text-xs font-medium text-green-300">
                          {selectedIngredient.category}
                        </span>

                      )}

                    </div>

                    {/* HARM LEVEL */}

                    <div className="relative mt-6 rounded-xl border border-gray-800 bg-[#151817] p-4">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-[11px] uppercase tracking-[0.15em] text-gray-500">
                          Harm Level
                        </p>

                        <span className="text-[11px] text-gray-600">
                          Safety indicator
                        </span>

                      </div>

                      <div className="flex items-center gap-3 mt-2.5">

                        <span
                          className={`w-3 h-3 rounded-full ${harmDot(
                            selectedIngredient.harmLevel
                          )}`}
                        />

                        <p
                          className={`text-xl font-semibold ${harmColor(
                            selectedIngredient.harmLevel
                          )}`}
                        >
                          {selectedIngredient.harmLevel ||
                            'Not available'}
                        </p>

                      </div>

                    </div>

                    {/* SIDE EFFECTS */}

                    <div className="mt-7">

                      <div className="flex items-center gap-2 mb-3">

                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-400/10 border border-cyan-400/15">

                          <span className="w-2 h-2 rounded-full bg-cyan-400" />

                        </span>

                        <h4 className="text-sm font-semibold text-gray-200">
                          Side Effects
                        </h4>

                      </div>

                      {ingredientSideEffects.length >
                      0 ? (

                        <ul className="space-y-2">

                          {ingredientSideEffects.map(
                            (effect, index) => (

                              <li
                                key={index}
                                className="flex items-start gap-3 rounded-lg px-2 py-1.5 text-sm text-gray-400 leading-6 hover:bg-white/[0.02] transition-colors"
                              >

                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />

                                <span>
                                  {effect}
                                </span>

                              </li>

                            )
                          )}

                        </ul>

                      ) : (

                        <p className="text-sm text-gray-500">
                          No information available.
                        </p>

                      )}

                    </div>

                    {/* RESTRICTED FOR */}

                    <div className="mt-7 pt-6 border-t border-gray-800">

                      <div className="flex items-center gap-2 mb-3">

                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-400/10 border border-red-400/15">

                          <span className="w-2 h-2 rounded-full bg-red-400" />

                        </span>

                        <h4 className="text-sm font-semibold text-gray-200">
                          Restricted For
                        </h4>

                      </div>

                      {ingredientRestrictedFor.length >
                      0 ? (

                        <ul className="space-y-2">

                          {ingredientRestrictedFor.map(
                            (restriction, index) => (

                              <li
                                key={index}
                                className="flex items-start gap-3 rounded-lg px-2 py-1.5 text-sm text-gray-400 leading-6 hover:bg-white/[0.02] transition-colors"
                              >

                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />

                                <span>
                                  {restriction}
                                </span>

                              </li>

                            )
                          )}

                        </ul>

                      ) : (

                        <p className="text-sm text-gray-500">
                          No restrictions listed.
                        </p>

                      )}

                    </div>

                  </div>

                  {/* =====================================
                      RIGHT CARD - NUTRITION
                  ===================================== */}

                  <div className="relative overflow-hidden bg-gradient-to-br from-[#111216] via-[#111117] to-[#101018] border border-gray-800 rounded-2xl p-6 md:p-7 shadow-lg shadow-black/20">

                    {/* TOP ACCENT */}

                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-transparent" />

                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />

                    {/* HEADER */}

                    <div className="relative flex items-center justify-between gap-3">

                      <div>

                        <div className="flex items-center gap-2 mb-1">

                          <span className="w-2 h-2 rounded-full bg-blue-400" />

                          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                            Nutrition
                          </p>

                        </div>

                        <h3 className="text-2xl font-bold text-white">
                          Nutrients
                        </h3>

                      </div>

                      <span className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />

                      </span>

                    </div>

                    {/* NUTRIENT ROWS */}

                    {ingredientNutritionRows.length >
                    0 ? (

                      <div className="mt-5">

                        {ingredientNutritionRows.map(
                          (row, index) => (

                            <div
                              key={row.label}
                              className={`flex items-center justify-between gap-4 py-3.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors ${
                                index !==
                                ingredientNutritionRows.length -
                                  1
                                  ? 'border-b border-gray-800'
                                  : ''
                              }`}
                            >

                              <div className="flex items-center gap-3">

                                <span
                                  className={`w-2 h-2 rounded-full ${nutritionDot(
                                    row.label
                                  )}`}
                                />

                                <span className="text-sm text-gray-400">
                                  {row.label}
                                </span>

                              </div>

                              <span className="text-sm font-semibold text-white text-right">
                                {formatIngredientNutritionValue(
                                  row.value,
                                  row.unit
                                )}
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    ) : (

                      <div className="mt-6 rounded-xl bg-[#17181c] border border-gray-800 p-5">

                        <p className="text-sm text-gray-500">
                          Nutrition information will
                          appear here.
                        </p>

                      </div>

                    )}

                    {/* FOOTER */}

                    <div className="mt-5 flex items-start gap-2">

                      <span className="text-blue-400 text-xs mt-0.5">
                        ●
                      </span>

                      <p className="text-xs text-gray-600 leading-5">
                        Values are shown per 100 g
                        when provided by the database.
                      </p>

                    </div>

                  </div>

                </div>

              )}

          </section>

        )}

      </main>

    </div>
  );
}

export default Result;