import StatusBar from "../../../components/StatusBar";
import styles from "./Machines.module.css";

const TableControls = ({
  userID,
  users,
  handleUserChange,
  page,
  totalPages,
  setPage,
  machineStatus,
  handleMachineStatusChange,
  staleOnly,
  staleDays,
  clearStaleFilter,
}) => {
  return (
    <div className={styles.machineTableHeader}>
      <div className={styles.controlCard}>
        <div className={styles.tableController}>
          <div className={styles.controlField}>
            <label htmlFor="machine_user_id" className={styles.controlLabel}>
              User
            </label>
            <select
              id="machine_user_id"
              name="user_id"
              value={userID}
              onChange={handleUserChange}
              className={styles.machineTableUserSelect}
            >
              <option value="">All</option>
              {users.map(({ id, first_name, last_name }) => (
                <option value={id} key={id}>
                  {first_name} {last_name}
                </option>
              ))}
            </select>
          </div>
          <StatusBar
            machineStatus={machineStatus}
            setMachineStatus={handleMachineStatusChange}
          />
        </div>
        <div className={styles.paginatorRow}>
          <span className={styles.pagerLabel}>Page</span>
          <div className={styles.paginator}>
            <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
        {staleOnly && (
          <div className={styles.filterNotice}>
            <div className={styles.filterCopy}>
              <strong>Review Queue Active</strong>
              <span>Showing in-progress machines opened {staleDays}+ days ago.</span>
            </div>
            <button type="button" onClick={clearStaleFilter}>
              Show all active
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableControls;
