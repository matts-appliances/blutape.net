import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import { requestJson } from "../utils/api";

const RootLayout = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();

  const logout = async () => {
    if (!confirm("Logout?")) return;
    try {
      const data = await requestJson("/api/auth/logout");
      toast.success(data.message || "Logged out");
      setUser(null);
    } catch (error) {
      console.error("[LOGOUT ERROR]: ", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <>
      <header>
        <Link to={"/"}>
          <img
            src="/blu-logo-512.png"
            alt="bluTape logo"
            className="header-logo"
          />
        </Link>
        {user && (
          <div className="header-actions">
            <button
              type="button"
              className="manifest-launch"
              onClick={() => {
                const returnTo = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
                window.location.href = `https://manifest.blutape.net/?return_to=${encodeURIComponent(returnTo)}`;
              }}
            >
              Open Manifest
            </button>
            <button className="logout-button" onClick={logout}>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      {user && <Navbar />}

      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
};

export default RootLayout;
