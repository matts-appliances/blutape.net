import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { requestJson } from "../../../utils/api";
import styles from "../AuthCard.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await requestJson("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSubmitted(true);
      toast.success(data.message);
    } catch (error) {
      console.error("[FORGOT PASSWORD ERROR]:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.authShell}>
      <form onSubmit={handleSubmit} className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Reset password</h1>
          <p>Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {submitted && (
          <p className={styles.note}>
            If the account exists, the email should arrive shortly.
          </p>
        )}

        <div className={styles.fieldGroup}>
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

        <div className={styles.supportRow}>
          <Link to="/login" className={styles.textLink}>
            Back to login
          </Link>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Sending..."
            : submitted
              ? "Send another link"
              : "Send reset link"}
        </button>
      </form>
    </section>
  );
};

export default ForgotPassword;
