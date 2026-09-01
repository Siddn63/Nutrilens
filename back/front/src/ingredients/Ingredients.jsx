import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

const Ingredient = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { name } = useParams();

  const API = import.meta.env.VITE_API_URL || 'https://nutrilens-backend-0wkr.onrender.com';

  // Ingredients shown when the page is opened
  const popularIngredients = [
    'Sodium Benzoate',
    'Citric Acid',
    'Monosodium Glutamate',
    'Aspartame',
    'Potassium Sorbate',
    'Tartrazine',
    'Sodium Nitrite',
    'Sodium Nitrate',
    'BHA',
    'BHT',
    'Sulphites',
    'Sucralose',
    'Buttermilk',
    'Palm Oil',
    'Refined Wheat Flour',
  ];

  // --------------------------------------------------
  // GET ONE INGREDIENT
  // --------------------------------------------------
  const fetchIngredient = async (ingredientName) => {
    const cleanName = ingredientName?.trim();

    if (!cleanName) return;

    try {
      setLoading(true);
      setError('');
      setSelectedIngredient(null);

      // First try the normal ingredient endpoint
      try {
        const res = await axios.get(
          `${API}/ingredient/${encodeURIComponent(cleanName)}`
        );

        if (res.data) {
          setSelectedIngredient(res.data);
          return;
        }
      } catch (directError) {
        console.log(
          'Direct ingredient lookup failed. Trying search...',
          directError
        );
      }

      // If direct lookup fails, search for the ingredient
      const searchRes = await axios.get(
        `${API}/search?name=${encodeURIComponent(cleanName)}`
      );

      let results = [];

      if (Array.isArray(searchRes.data)) {
        results = searchRes.data;
      } else if (Array.isArray(searchRes.data?.results)) {
        results = searchRes.data.results;
      } else if (Array.isArray(searchRes.data?.data)) {
        results = searchRes.data.data;
      }

      // Find exact match first
      const exactMatch = results.find((item) => {
        const itemName =
          item?.name ||
          item?.ingredientName ||
          item?.ingredient_name ||
          item;

        return (
          String(itemName).trim().toLowerCase() ===
          cleanName.toLowerCase()
        );
      });

      // If exact match exists
      if (exactMatch) {
        if (typeof exactMatch === 'object') {
          const exactName =
            exactMatch.name ||
            exactMatch.ingredientName ||
            exactMatch.ingredient_name ||
            cleanName;

          // Try to get complete ingredient data
          try {
            const exactRes = await axios.get(
              `${API}/ingredient/${encodeURIComponent(exactName)}`
            );

            if (exactRes.data) {
              setSelectedIngredient(exactRes.data);
              return;
            }
          } catch (error) {
            console.log(
              'Could not fetch complete ingredient data.',
              error
            );

            // Show whatever search returned
            setSelectedIngredient(exactMatch);
            return;
          }
        }

        setSelectedIngredient(exactMatch);
        return;
      }

      // If exact match doesn't exist, use first search result
      if (results.length > 0) {
        const firstResult = results[0];

        if (typeof firstResult === 'object') {
          const firstName =
            firstResult.name ||
            firstResult.ingredientName ||
            firstResult.ingredient_name ||
            cleanName;

          try {
            const firstRes = await axios.get(
              `${API}/ingredient/${encodeURIComponent(firstName)}`
            );

            if (firstRes.data) {
              setSelectedIngredient(firstRes.data);
              return;
            }
          } catch {
            setSelectedIngredient(firstResult);
            return;
          }
        }
      }

      throw new Error('Ingredient not found');
    } catch (err) {
      console.error('Ingredient fetch error:', err);

      setError(
        'Ingredient not found. Try another ingredient.'
      );

      setSelectedIngredient(null);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SEARCH SUGGESTIONS
  // --------------------------------------------------
  const fetchSuggestions = async (search) => {
    const cleanSearch = search.trim();

    if (!cleanSearch) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API}/search?name=${encodeURIComponent(cleanSearch)}`
      );

      if (Array.isArray(res.data)) {
        setSuggestions(res.data);
      } else if (Array.isArray(res.data?.results)) {
        setSuggestions(res.data.results);
      } else if (Array.isArray(res.data?.data)) {
        setSuggestions(res.data.data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Ingredient search error:', err);
      setSuggestions([]);
    }
  };

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------
  const handleChange = (e) => {
    const value = e.target.value;

    setQuery(value);
    setError('');

    if (value.trim().length > 1) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setSelectedIngredient(null);
    }
  };

  // --------------------------------------------------
  // SEARCH BUTTON / ENTER
  // --------------------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();

    setSuggestions([]);

    if (query.trim()) {
      fetchIngredient(query);
    }
  };

  // --------------------------------------------------
  // CLICK INGREDIENT
  // --------------------------------------------------
  const handleSelect = (ingredientName) => {
    const cleanName = String(ingredientName || '').trim();

    if (!cleanName) return;

    // Put name inside search box
    setQuery(cleanName);

    // Remove suggestions
    setSuggestions([]);

    // Remove previous errors
    setError('');

    // THIS SHOWS THE BIG RESULT CARD
    fetchIngredient(cleanName);
  };

  // --------------------------------------------------
  // URL INGREDIENT
  // --------------------------------------------------
  useEffect(() => {
    if (name) {
      const decodedName = decodeURIComponent(name);

      setQuery(decodedName);
      fetchIngredient(decodedName);
    }
  }, [name]);

  // --------------------------------------------------
  // HARM LEVEL STYLE
  // --------------------------------------------------
  const getHarmStyles = (level) => {
    switch (level) {
      case 'High':
        return {
          dot: 'bg-red-500',
          text: 'text-red-400',
        };

      case 'Moderate':
        return {
          dot: 'bg-orange-400',
          text: 'text-orange-400',
        };

      case 'Medium':
        return {
          dot: 'bg-yellow-400',
          text: 'text-yellow-400',
        };

      case 'Low':
        return {
          dot: 'bg-green-400',
          text: 'text-green-400',
        };

      default:
        return {
          dot: 'bg-gray-400',
          text: 'text-gray-400',
        };
    }
  };

  const harmStyles = getHarmStyles(
    selectedIngredient?.harmLevel
  );

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <Navbar />

      <main className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">

          {/* =========================================
              SEARCH
          ========================================= */}

          <div className="max-w-2xl mx-auto">

            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
              Search for an Ingredient
            </h2>

            <form
              onSubmit={handleSearch}
              className="relative"
            >

              <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="e.g. Sodium Benzoate"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-2xl
                  bg-[#202020]
                  border
                  border-[#333]
                  text-white
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:border-green-500
                  focus:ring-1
                  focus:ring-green-500
                  transition
                "
              />

              {/* SEARCH SUGGESTIONS */}

              {suggestions.length > 0 && (
                <div
                  className="
                    absolute
                    top-full
                    left-0
                    right-0
                    mt-2
                    bg-[#202020]
                    border
                    border-[#333]
                    rounded-xl
                    overflow-hidden
                    shadow-2xl
                    z-20
                  "
                >

                  {suggestions
                    .slice(0, 8)
                    .map((item, index) => {

                      const itemName =
                        item?.name ||
                        item?.ingredientName ||
                        item?.ingredient_name ||
                        item;

                      return (
                        <button
                          key={`${itemName}-${index}`}
                          type="button"
                          onClick={() =>
                            handleSelect(itemName)
                          }
                          className="
                            w-full
                            text-left
                            px-5
                            py-3
                            text-sm
                            text-gray-200
                            hover:bg-[#2b2b2b]
                            hover:text-green-400
                            border-b
                            border-[#2d2d2d]
                            last:border-b-0
                            transition
                          "
                        >
                          {itemName}
                        </button>
                      );
                    })}

                </div>
              )}

            </form>

            {/* LOADING */}

            {loading && (
              <p className="text-center text-gray-500 text-sm mt-5">
                Loading ingredient...
              </p>
            )}

            {/* ERROR */}

            {error && !loading && (
              <p className="text-center text-red-400 text-sm mt-5">
                {error}
              </p>
            )}

          </div>


          {/* =========================================
              POPULAR INGREDIENTS
          ========================================= */}

          {!selectedIngredient &&
            !loading &&
            !query && (

              <div className="max-w-2xl mx-auto mt-8">

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-500
                    mb-3
                  "
                >
                  Popular ingredients
                </p>

                <div className="flex flex-wrap gap-2">

                  {popularIngredients.map(
                    (ingredient) => (

                      <button
                        key={ingredient}
                        type="button"
                        onClick={() =>
                          handleSelect(ingredient)
                        }
                        className="
                          px-4
                          py-2
                          rounded-full
                          bg-[#202020]
                          border
                          border-[#333]
                          text-sm
                          text-gray-300
                          hover:border-green-500
                          hover:text-green-400
                          hover:bg-[#242424]
                          transition
                        "
                      >
                        {ingredient}
                      </button>

                    )
                  )}

                </div>

              </div>
            )}


          {/* =========================================
              RESULT CARD
          ========================================= */}

          {selectedIngredient && (

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                ease: 'easeOut',
              }}
              className="
                mt-12
                bg-[#202020]
                rounded-2xl
                border
                border-[#2f2f2f]
                overflow-hidden
                shadow-2xl
              "
            >

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  p-6
                  sm:p-8
                  gap-8
                "
              >

                {/* =================================
                    IMAGE
                ================================= */}

                <div
                  className="
                    w-full
                    md:w-80
                    h-56
                    md:h-64
                    shrink-0
                    rounded-xl
                    bg-[#2b2b2b]
                    overflow-hidden
                    flex
                    items-center
                    justify-center
                  "
                >

                  {selectedIngredient.image_url ? (

                    <img
                      src={selectedIngredient.image_url}
                      alt={
                        selectedIngredient.name ||
                        'Ingredient'
                      }
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                      onError={(e) => {
                        e.currentTarget.style.display =
                          'none';

                        if (
                          e.currentTarget
                            .nextElementSibling
                        ) {
                          e.currentTarget
                            .nextElementSibling.style.display =
                            'flex';
                        }
                      }}
                    />

                  ) : null}

                  <div
                    className="
                      w-full
                      h-full
                      items-center
                      justify-center
                      text-gray-500
                      text-sm
                    "
                    style={{
                      display:
                        selectedIngredient.image_url
                          ? 'none'
                          : 'flex',
                    }}
                  >
                    Image Not Found
                  </div>

                </div>


                {/* =================================
                    DETAILS
                ================================= */}

                <div className="flex-1 min-w-0">

                  {/* NAME + HARM LEVEL */}

                  <div
                    className="
                      flex
                      flex-wrap
                      items-start
                      justify-between
                      gap-4
                    "
                  >

                    <div>

                      <h3
                        className="
                          text-3xl
                          sm:text-4xl
                          font-bold
                          text-green-500
                        "
                      >
                        {selectedIngredient.name}
                      </h3>

                      {selectedIngredient.category && (

                        <span
                          className="
                            inline-block
                            mt-4
                            px-4
                            py-2
                            rounded-full
                            bg-[#303030]
                            text-sm
                            text-gray-200
                          "
                        >
                          {selectedIngredient.category}
                        </span>

                      )}

                    </div>


                    {selectedIngredient.harmLevel && (

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          px-4
                          py-2
                          rounded-full
                          bg-[#303030]
                          shrink-0
                        "
                      >

                        <span
                          className={`
                            w-2.5
                            h-2.5
                            rounded-full
                            ${harmStyles.dot}
                          `}
                        />

                        <span
                          className={`
                            text-sm
                            font-medium
                            ${harmStyles.text}
                          `}
                        >
                          Harm Level:{' '}
                          {selectedIngredient.harmLevel}
                        </span>

                      </div>

                    )}

                  </div>


                  {/* =================================
                      MAX CONSUMPTION
                  ================================= */}

                  {selectedIngredient.maxConsumption && (

                    <div className="mt-7">

                      <h4
                        className="
                          text-xl
                          font-bold
                          text-cyan-400
                          mb-2
                        "
                      >
                        Max Consumption (g/day)
                      </h4>

                      <ul
                        className="
                          space-y-1
                          text-gray-300
                          text-sm
                          sm:text-base
                        "
                      >

                        <li>
                          • 1–10 years:{' '}
                          {selectedIngredient
                            .maxConsumption[
                              '1-10 years'
                            ] ?? 0}
                          g
                        </li>

                        <li>
                          • 10–16 years:{' '}
                          {selectedIngredient
                            .maxConsumption[
                              '10-16 years'
                            ] ?? 0}
                          g
                        </li>

                        <li>
                          • 16+ years:{' '}
                          {selectedIngredient
                            .maxConsumption[
                              '16+ years'
                            ] ?? 0}
                          g
                        </li>

                      </ul>

                    </div>

                  )}


                  {/* =================================
                      RESTRICTED FOR
                  ================================= */}

                  {Array.isArray(
                    selectedIngredient.restrictedFor
                  ) &&
                    selectedIngredient.restrictedFor
                      .length > 0 && (

                      <div className="mt-6">

                        <h4
                          className="
                            text-xl
                            font-bold
                            text-red-400
                            mb-1
                          "
                        >
                          Restricted For
                        </h4>

                        <ul
                          className="
                            space-y-1
                            text-gray-300
                            text-sm
                            sm:text-base
                          "
                        >

                          {selectedIngredient
                            .restrictedFor
                            .map(
                              (item, index) => (

                                <li key={index}>
                                  • {item}
                                </li>

                              )
                            )}

                        </ul>

                      </div>

                    )}


                  {/* =================================
                      SIDE EFFECTS
                  ================================= */}

                  {Array.isArray(
                    selectedIngredient.sideEffects
                  ) &&
                    selectedIngredient.sideEffects
                      .length > 0 && (

                      <div className="mt-6">

                        <h4
                          className="
                            text-xl
                            font-bold
                            text-orange-400
                            mb-1
                          "
                        >
                          Side Effects
                        </h4>

                        <ul
                          className="
                            space-y-1
                            text-gray-300
                            text-sm
                            sm:text-base
                          "
                        >

                          {selectedIngredient
                            .sideEffects
                            .map(
                              (item, index) => (

                                <li key={index}>
                                  • {item}
                                </li>

                              )
                            )}

                        </ul>

                      </div>

                    )}

                </div>

              </div>

            </motion.div>

          )}

        </div>
      </main>
    </div>
  );
};

export default Ingredient;