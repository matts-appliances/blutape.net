import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";
import { requestJson } from "../../utils/api";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState(() => ({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirm("Update profile?")) return;

    try {
      const data = await requestJson("/api/update/user/me", {
        method: "PATCH",
        body: formData,
      });
      setUser(data.user);
      toast.success(data.message);
    } catch (error) {
      console.error("[PROFILE UPDATE ERROR]: ", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const hasChanges =
    formData.first_name !== (user?.first_name || "") ||
    formData.last_name !== (user?.last_name || "") ||
    formData.email !== (user?.email || "");

  const handleLogout = async () => {
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
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Profile</h1>
        <p>Update your account details and manage your session.</p>
      </div>
      <form className={styles.profileForm} onSubmit={handleSubmit}>
        <label htmlFor="first_name">First Name</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="last_name">Last Name</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={!hasChanges}>
          Save Changes
        </button>
      </form>
      <div className={styles.profileDangerZone}>
        <p>Need to switch techs or end your session?</p>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
