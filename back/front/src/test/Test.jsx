import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "https://nutrilens-backend-0wkr.onrender.com";

const Test = () => {
  const { id } = useParams();
  const location = useLocation();
  const quantity = new URLSearchParams(location.search).get("quantity") || "100";
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("Users"));
    } catch {
      return null;
    }
  })();
  const userId = user && user._id ? user._id : null;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    fetch(`${API}/test/${id}?quantity=${quantity}&userId=${userId}`)
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to fetch");
        }
        return res.json();
      })
      .then((data) => setResult(data))
      .catch((err) => setError(err.message || "Error fetching test results."))
      .finally(() => setLoading(false));
  }, [id, quantity, userId]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181818]">
        <div className="bg-[#232323] p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
          <p className="text-gray-300">You must be logged in to view your test results.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181818]">
        <div className="text-white text-xl font-semibold">Loading test results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181818]">
        <div className="bg-[#232323] p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { matched_allergies = [], matched_preconditions = [], veg_match } = result;
  const safe =
    matched_allergies.length === 0 && matched_preconditions.length === 0 && veg_match;

  return (
    <div className="min-h-screen bg-[#181818]">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-16 p-4">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Test Result</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allergy Matches Card */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              matched_allergies.length === 0
                ? "bg-[#1b2c1b] border border-green-700"
                : "bg-[#2a1b1b] border border-red-700"
            }`}
          >
            <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
              <span role="img" aria-label="allergy">
                🌾
              </span>
              Allergy Matches
            </h2>
            {matched_allergies.length === 0 ? (
              <p className="text-green-400 font-medium">No matching allergies detected.</p>
            ) : (
              <ul className="list-disc ml-6">
                {matched_allergies.map((a, i) => (
                  <li key={i} className="text-red-400 font-medium">
                    ⚠ {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Precondition Conflicts Card */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              matched_preconditions.length === 0
                ? "bg-[#1b2c1b] border border-green-700"
                : "bg-[#2a261b] border border-yellow-700"
            }`}
          >
            <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
              <span role="img" aria-label="precondition">
                🩺
              </span>
              Precondition Conflicts
            </h2>
            {matched_preconditions.length === 0 ? (
              <p className="text-green-400 font-medium">No precondition conflicts found.</p>
            ) : (
              <ul className="list-disc ml-6">
                {matched_preconditions.map((p, i) => (
                  <li key={i} className="text-yellow-400 font-medium">
                    ⚠ {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Diet Match Card */}
          <div
            className={`rounded-xl shadow-lg p-6 ${
              veg_match
                ? "bg-[#1b2c1b] border border-green-700"
                : "bg-[#2a1b1b] border border-red-700"
            }`}
          >
            <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
              <span role="img" aria-label="diet">
                🥗
              </span>
              Diet Match
            </h2>
            <p className={veg_match ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
              {veg_match
                ? "✔️ Matches your dietary preference"
                : "❌ Does not match your dietary preference"}
            </p>
          </div>
          {/* Overall Recommendation Card */}
          <div
            className={`rounded-xl shadow-lg p-6 flex flex-col justify-between ${
              safe
                ? "bg-[#1b2c1b] border border-green-700"
                : "bg-[#2a1b1b] border border-yellow-700"
            }`}
          >
            <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
              <span role="img" aria-label="recommendation">
                📝
              </span>
              Overall Recommendation
            </h2>
            {safe ? (
              <div>
                <p className="text-green-400 font-medium text-lg">
                  ✅ Safe to Consume
                </p>
                <p className="text-gray-300 mt-2">
                  No allergy or precondition conflicts found. This product matches your dietary preference.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-400 font-medium text-lg">
                  ⚠ Consume with Caution
                </p>
                <ul className="text-gray-300 mt-2 list-disc ml-6">
                  {matched_allergies.length > 0 && (
                    <li className="text-red-400">
                      Allergy risks: {matched_allergies.join(", ")}
                    </li>
                  )}
                  {matched_preconditions.length > 0 && (
                    <li className="text-yellow-400">
                      Precondition conflicts: {matched_preconditions.join(", ")}
                    </li>
                  )}
                  {!veg_match && (
                    <li className="text-red-400">
                      Does not match your dietary preference.
                    </li>
                  )}
                </ul>
                <p className="text-gray-400 mt-2">
                  ❗ Please consult a healthcare provider before consuming this product.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
