import React from "react";
import Login from "./Login";
import Logout from "./Logout";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";

function Navbar({ className = "", fixed = true }) {
  const [authUser] = useAuth();

  return (
    <div
      className={`
        ${fixed ? "fixed top-0 left-0" : "relative"}
        w-full h-20
        z-50
        px-7
        flex
        justify-between
        items-center
        text-white
        bg-transparent
        ${className}
      `}
    >
      {/* LEFT */}
      <div className="navbar-start">

        {/* Mobile menu */}
        <div className="dropdown">

          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>

          <ul
            tabIndex={0}
            className="
              menu menu-sm
              dropdown-content
              bg-black/90
              backdrop-blur-md
              text-white
              rounded-box
              z-[60]
              mt-3
              w-52
              p-2
              shadow-xl
            "
          >
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/ingredients">Ingredients</Link>
            </li>

            <li>
              <Link to="/profile">Profile</Link>
            </li>

            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>

        </div>

        {/* LOGO */}
        <Link
          to="/"
          className="
            font-bold
            cursor-pointer
            text-2xl
            text-green-400
            hover:text-green-300
            transition-colors
          "
        >
          Nutrilens
        </Link>

      </div>


      {/* CENTER */}
      <div className="navbar-center hidden lg:flex">

        <ul className="menu menu-horizontal px-1 gap-1">

          <li>
            <Link
              to="/"
              className="text-white hover:text-green-400 transition-colors"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/ingredients"
              className="text-white hover:text-green-400 transition-colors"
            >
              Ingredients
            </Link>
          </li>

          <li>
            <Link
              to="/profile"
              className="text-white hover:text-green-400 transition-colors"
            >
              Profile
            </Link>
          </li>

          <li>
            <Link
              to="/about"
              className="text-white hover:text-green-400 transition-colors"
            >
              About
            </Link>
          </li>

        </ul>

      </div>


      {/* RIGHT */}
      <div className="navbar-end">

        {authUser ? (

          <Logout />

        ) : (

          <div>

            <button
              type="button"
              className="
                bg-green-400
                text-black
                px-4
                py-1.5
                rounded-md
                text-sm
                font-semibold
                hover:bg-green-300
                transition-all
                duration-200
                cursor-pointer
              "
              onClick={() =>
                document
                  .getElementById("my_modal_3")
                  ?.showModal()
              }
            >
              Login
            </button>

            <Login />

          </div>

        )}

      </div>

    </div>
  );
}

export default Navbar;