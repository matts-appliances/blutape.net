import styles from "./Machines.module.css";
import { brands } from "../../../utils/Schemas";
import { VENDORS } from "../../../utils/Enums";

const MachineList = ({ machines, onSelectMachine }) => {
  return (
    <ul className={styles.machineList}>
      {machines?.map(
        ({ id, brand, model, serial, color, vendor }) => (
          <li
            key={id}
            className={styles.machineListItem}
            onClick={() => onSelectMachine(id)}
          >
            <h2 className={styles.machineItemHeader}>
              {brands[brand]} - <small>[{model}]</small>
            </h2>
            <div className={styles.machineItemBody}>
              <p className={styles.machineItemRow}>
                <span className={styles.machineItemLabel}>Serial</span>
                <span className={styles.machineItemValue}>{serial}</span>
              </p>
              <p className={styles.machineItemRow}>
                <span className={styles.machineItemLabel}>Color</span>
                <span className={styles.machineItemValue}>{color}</span>
              </p>
              <p className={styles.machineItemRow}>
                <span className={styles.machineItemLabel}>Vendor</span>
                <span className={styles.machineItemValue}>{VENDORS[vendor]}</span>
              </p>
            </div>
          </li>
        ),
      )}
    </ul>
  );
};

export default MachineList;
