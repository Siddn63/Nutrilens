import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import homeImg from '../assets/img_home.png';
import QrScanner from '../components/QrScanner';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthProvider';
import Login from '../components/Login';

const Home = () => {
  const [authUser] = useAuth();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantities, setQuantities] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState('');

  const [showScanner, setShowScanner] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API = 'https://nutrilens-backend-0wkr.onrender.com';

  // --------------------------------------------------
  // PRODUCT SUGGESTIONS
  // --------------------------------------------------
  useEffect(() => {
  const fetchSuggestions = async () => {
    const trimmedQuery = query.trim();

    if (trimmedQuery === '') {
      setSuggestions([]);
      return;
    }

    if (
      selectedProduct &&
      trimmedQuery === selectedProduct.name.trim()
    ) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API}/select/suggestions?query=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      setSuggestions(res.data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      toast.error('Error fetching product suggestions.');
    }
  };

  fetchSuggestions();
}, [query, selectedProduct]);

  // --------------------------------------------------
  // FETCH QUANTITIES
  // --------------------------------------------------
  useEffect(() => {
    const fetchQuantities = async () => {
      if (!selectedProduct) {
        setQuantities([]);
        setSelectedQuantity('');
        return;
      }

      try {
        const res = await axios.get(
          `${API}/select/quantities?name=${encodeURIComponent(
            selectedProduct.name
          )}`
        );

        setQuantities(res.data);

        if (res.data.length > 0) {
          setSelectedQuantity(res.data[0].quantity);
        } else {
          setSelectedQuantity('');
        }
      } catch (err) {
        console.error('Error fetching quantities:', err);
        toast.error('Error fetching quantities for selected product.');
      }
    };

    fetchQuantities();
  }, [selectedProduct]);

  // --------------------------------------------------
  // SELECT PRODUCT FROM SEARCH SUGGESTIONS
  // --------------------------------------------------
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setSelectedProduct(suggestion);
    setSuggestions([]);
  };

  // --------------------------------------------------
  // NORMAL PRODUCT SEARCH
  // --------------------------------------------------
  const handleSearch = () => {
    if (!selectedProduct) {
      toast.warning('Please select a product.');
      return;
    }

    if (!selectedQuantity) {
      toast.warning('Please select a quantity.');
      return;
    }

    navigate(
      `/result/${selectedProduct._id}?quantity=${encodeURIComponent(
        selectedQuantity
      )}`
    );
  };

  // --------------------------------------------------
  // BARCODE SCANNER
  // --------------------------------------------------
  const handleScanSuccess = async (barcode) => {
    if (!barcode) {
      toast.error('Barcode could not be detected.');
      return;
    }

    const cleanBarcode = String(barcode).trim();

    if (!cleanBarcode) {
      toast.error('Invalid barcode.');
      return;
    }

    setLoading(true);

    try {
      console.log('Scanned barcode:', cleanBarcode);

      // Search your MongoDB through your backend
      const response = await axios.get(
        `${API}/select/barcode/${encodeURIComponent(cleanBarcode)}`
      );

      console.log('Product received from backend:', response.data);

      const product = response.data;

      if (!product || !product._id) {
        toast.error('Product not found for this barcode.');
        return;
      }

      // Close scanner
      setShowScanner(false);

      // Reset scanner
      setScannerKey((prev) => prev + 1);

      // Open the exact product's Result page
      if (
        product.available_quantities &&
        product.available_quantities.length > 0
      ) {
        const defaultQuantity =
          product.available_quantities[0].quantity;

        navigate(
          `/result/${product._id}?quantity=${encodeURIComponent(
            defaultQuantity
          )}`
        );
      } else {
        navigate(`/result/${product._id}`);
      }
    } catch (error) {
      console.error(
        'Barcode lookup error:',
        error.response?.data || error.message
      );

      if (error.response?.status === 404) {
        toast.error(
          `No product found in MongoDB for barcode: ${cleanBarcode}`
        );
      } else {
        toast.error('Unable to find product using this barcode.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UPLOAD BARCODE IMAGE
  // --------------------------------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);

    try {
      console.log('Uploading barcode image...');

      const response = await axios.post(
        `${API}/select/scan-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Barcode image response:', response.data);

      const data = response.data;

      // If backend directly returned the product
      if (data && data._id) {
        setShowScanner(false);
        navigate(`/result/${data._id}`);
        return;
      }

      // If backend returned a barcode
      if (data && data.barcode) {
        await handleScanSuccess(data.barcode);
        return;
      }

      toast.error('Product not found with this barcode.');
    } catch (error) {
      console.error(
        'Image upload error:',
        error.response?.data || error.message
      );

      toast.error('Unable to read the barcode from this image.');
    } finally {
      setLoading(false);

      // Reset file input
      e.target.value = '';
    }
  };

  // --------------------------------------------------
  // LOGIN SCREEN
  // --------------------------------------------------
  if (!authUser) {
    return (
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-end relative"
        style={{
          backgroundImage: `url(${homeImg})`,
        }}
      >
        <Navbar />

        <div className="relative z-10 bg-black/70 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl max-w-sm w-full mx-6 md:mr-16">
          <h2 className="text-white text-2xl font-bold text-center mb-3">
            Please Login / Signup to Continue
          </h2>

          <p className="text-amber-400 text-sm font-medium text-center mb-6">
            Your profile will be used to check product compatibility with you
          </p>

          <Login />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN HOME PAGE
  // --------------------------------------------------
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${homeImg})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <Navbar />

      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full border-4 border-white/20 border-t-emerald-400 h-14 w-14" />

            <p className="text-white font-medium">
              Finding product...
            </p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex justify-center items-center pt-24 pb-10 px-4">
        <div className="bg-gray-800/80 backdrop-blur-md border border-white/10 mt-10 rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8">

          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white tracking-tight">
            Search Product
          </h2>

          {/* SEARCH */}
          <div className="mb-5 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedProduct(null);
                setQuantities([]);
                setSelectedQuantity('');
              }}
              placeholder="Search for a product..."
              className="w-full p-3 rounded-xl bg-white text-black placeholder-gray-500 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />

            {suggestions.length > 0 && (
              <ul className="absolute w-full border border-gray-700 rounded-xl mt-1 bg-gray-900/95 backdrop-blur shadow-xl max-h-48 overflow-y-auto z-20">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion._id}
                    onClick={() =>
                      handleSuggestionClick(suggestion)
                    }
                    className="px-4 py-2 text-gray-100 hover:bg-emerald-600/80 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* QUANTITY */}
          {quantities.length > 0 && (
            <div className="mb-6">
              <label className="block mb-1.5 font-medium text-gray-200 text-sm">
                Select Quantity
              </label>

              <select
                value={selectedQuantity}
                onChange={(e) =>
                  setSelectedQuantity(e.target.value)
                }
                className="w-full p-2.5 rounded-xl bg-white/95 text-gray-900 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                {quantities.map((quantity, index) => (
                  <option
                    key={index}
                    value={quantity.quantity}
                  >
                    {quantity.quantity}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex flex-col md:flex-row justify-center gap-3 mt-2">

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              disabled={
                !selectedProduct || !selectedQuantity
              }
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Search
            </button>

            {/* SCAN BUTTON */}
            <button
              onClick={() => {
                setShowScanner(true);
                setScannerKey((prev) => prev + 1);
              }}
              className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:bg-emerald-500 active:scale-[0.98] transition"
            >
              Scan Barcode
            </button>

            {/* UPLOAD BUTTON */}
            <label className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:bg-purple-500 active:scale-[0.98] cursor-pointer flex justify-center items-center transition">
              Upload Barcode

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* SCANNER */}
          {showScanner && (
            <div className="mt-6 border-t border-white/10 pt-6">

              <QrScanner
                key={scannerKey}
                onScanSuccess={handleScanSuccess}
                onCancel={() => {
                  setShowScanner(false);
                  setScannerKey((prev) => prev + 1);
                }}
              />

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;