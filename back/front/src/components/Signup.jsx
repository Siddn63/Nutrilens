import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./Login.jsx";
import { useForm } from "react-hook-form";
import axios from "../utils/axios.jsx";
import toast from "react-hot-toast";

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const userInfo = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      age: data.age,
      vegNonVeg: data.vegNonVeg,
    };

    await axios
      .post("/user/signup", userInfo)
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          toast.success("Signup Successfully");
          navigate(from, { replace: true });
        }
        localStorage.setItem("Users", JSON.stringify(res.data.user));
      })
      .catch((err) => {
        if (err.response) {
          console.log(err);
          toast.error("Error: " + err.response.data.message);
        }
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10">
      <div className="relative bg-gray-900 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Close Button */}
          <Link
            to="/"
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
          >
            ✕
          </Link>

          {/* Header */}
          <h3 className="font-bold text-2xl text-center text-white mb-1">Create Account</h3>
          <p className="text-gray-400 text-sm text-center mb-6">Join Nutrilens to get started</p>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm mb-1.5 text-gray-300">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              {...register("fullname", { required: true })}
            />
            {errors.fullname && (
              <span className="text-xs text-red-400">This field is required</span>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm mb-1.5 text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="text-xs text-red-400">This field is required</span>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm mb-1.5 text-gray-300">Create Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <span className="text-xs text-red-400">This field is required</span>
            )}
          </div>

          {/* Age & Diet Preference Side-by-Side */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label className="block text-sm mb-1.5 text-gray-300">Age</label>
              <input
                type="number"
                placeholder="Age"
                className="w-full px-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                {...register("age", {
                  required: "Age is required",
                  min: { value: 1, message: "Min age is 1" },
                  max: { value: 120, message: "Max age is 120" },
                })}
              />
              {errors.age && (
                <span className="text-xs text-red-400">{errors.age.message}</span>
              )}
            </div>

            {/* Diet Preference */}
            <div>
              <label className="block text-sm mb-1.5 text-gray-300">Diet Preference</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                {...register("vegNonVeg", {
                  required: "Please select your diet preference",
                })}
              >
                <option value="">Select...</option>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
              {errors.vegNonVeg && (
                <span className="text-xs text-red-400">{errors.vegNonVeg.message}</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium shadow-md hover:bg-emerald-500 active:scale-[0.98] transition"
          >
            Signup
          </button>

          {/* Login Prompt */}
          <p className="text-sm text-gray-400 mt-5 text-center">
            Already have an account?{" "}
            <Link to="/" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={() => document.getElementById("my_modal_3").showModal()}
              >
                Login
              </button>
              <Login />
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;