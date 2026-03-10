import styles from "./MachineBar.module.css";
import { APPLIANCE_CATEGORIES } from "../utils/Enums";

const MachineBar = ({ applianceCategory, setApplianceCategory }) => {
  return (
    <div className={styles.applianceCatGroup}>
      <label className={styles.applianceCatLabel} htmlFor="appliance_category">
        Appliance Category
      </label>
      <p className={styles.applianceCatHint}>
        Pick a category first to unlock the machine style options below.
      </p>
      <select
        name="appliance_category"
        id="appliance_category"
        className={styles.applianceCat}
        value={applianceCategory}
        onChange={(e) => setApplianceCategory(e.target.value)}
      >
        <option value="">--select appliance--</option>
        {Object.entries(APPLIANCE_CATEGORIES).map(([value, label], index) => (
          <option value={value} key={index}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MachineBar;
