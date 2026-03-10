import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const RootLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <header>
        <Link to={"/"} className="header-brand">
          <img
            src="/blu-logo-512.png"
            alt="bluTape logo"
            className="header-logo"
          />
          <div className="header-brand-copy">
            <strong>bluTape</strong>
          </div>
        </Link>
        {user && (
          <div className="header-actions">
            {user?.role === "admin" && (
              <button
                type="button"
                className="manifest-launch"
                onClick={() => {
                  const returnTo = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
                  window.location.href = `https://manifest.blutape.net/?return_to=${encodeURIComponent(returnTo)}`;
                }}
              >
                Manifest
              </button>
            )}
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
