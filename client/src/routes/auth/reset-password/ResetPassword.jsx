import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { requestJson } from "../../../utils/api";
import styles from "../AuthCard.module.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [status, setStatus] = useState(token ? "checking" : "invalid");
  const [statusMessage, setStatusMessage] = useState(
    token ? "Checking your reset link..." : "Reset link is missing a token."
  );
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const validateToken = async () => {
      try {
        const data = await requestJson(
          `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
        );

        if (!cancelled) {
          setStatus("ready");
          setStatusMessage(data.message);
        }
      } catch (error) {
        console.error("[RESET PASSWORD VALIDATION ERROR]:", error);

        if (!cancelled) {
          setStatus("invalid");
          setStatusMessage(error.message);
        }
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await requestJson("/api/auth/reset-password", {
        method: "POST",
        body: { token, password1, password2 },
      });
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      console.error("[RESET PASSWORD ERROR]:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <section className={styles.authShell}>
        <div className={styles.statusCard}>
          <div className={styles.authHeader}>
            <h1>Reset password</h1>
            <p>{statusMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "invalid") {
    return (
      <section className={styles.authShell}>
        <div className={styles.statusCard}>
          <div className={styles.authHeader}>
            <h1>Reset password</h1>
            <p>{statusMessage}</p>
          </div>
          <div className={styles.supportRow}>
            <Link to="/forgot-password" className={styles.textLink}>
              Request a new link
            </Link>
            <Link to="/login" className={styles.textLink}>
              Back to login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.authShell}>
      <form onSubmit={handleSubmit} className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Choose a new password</h1>
          <p>Enter your new password below to finish the reset.</p>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password1">New password</label>
          <div className={styles.passwordField}>
            <input
              type={showPassword ? "text" : "password"}
              name="password1"
              value={password1}
              required
              onChange={(e) => setPassword1(e.target.value)}
              autoComplete="new-password"
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

        <div className={styles.fieldGroup}>
          <label htmlFor="password2">Confirm new password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password2"
            value={password2}
            required
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.supportRow}>
          <p className={styles.note}>{statusMessage}</p>
          <Link to="/login" className={styles.textLink}>
            Back to login
          </Link>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </section>
  );
};

export default ResetPassword;
