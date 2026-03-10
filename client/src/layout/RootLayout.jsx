import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { requestJson } from "../utils/api";

const RootLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const launchManifest = async () => {
    try {
      const data = await requestJson("/api/auth/manifest-access");
      const returnTo = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
      const baseUrl = data.payload?.base_url || "https://manifest.blutape.net";
      const accessToken = data.payload?.token;

      if (!accessToken) {
        throw new Error("Manifest access token missing");
      }

      window.location.href = `${baseUrl}/?access_token=${encodeURIComponent(accessToken)}&return_to=${encodeURIComponent(returnTo)}`;
    } catch (error) {
      console.error("[MANIFEST_LAUNCH_ERROR]:", error);
    }
  };

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
            <button
              type="button"
              className="manifest-launch"
              onClick={launchManifest}
            >
              Manifest
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
