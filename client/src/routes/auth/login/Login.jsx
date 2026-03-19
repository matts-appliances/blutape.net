import styles from "./Login.module.css";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { requestJson } from "../../../utils/api";

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await requestJson("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setUser(data.user);
      toast.success(data.message);
      navigate("/");
    } catch (error) {
      console.error("[LOGIN ERROR]: ", error);
      toast.error(error.message);
    }
  };

  return (
    <section className={styles.loginShell}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h1>Welcome back</h1>
        <p>Sign in to continue.</p>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordField}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>
    </section>
  );
};

export default Login;
