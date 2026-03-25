import styles from "./Machines.module.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import TableControls from "./TableControls";
import MachineList from "./MachineList";
import { useMachinesTable } from "./useMachinesTable";

const Machines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parsedStaleDays = Number.parseInt(searchParams.get("stale_days") ?? "3", 10);
  const initialStaleDays = Number.isFinite(parsedStaleDays) && parsedStaleDays > 0
    ? parsedStaleDays
    : 3;
  const {
    userID,
    machineStatus,
    machines,
    page,
    totalPages,
    users,
    staleOnly,
    staleDays,
    setPage,
    handleUserChange,
    handleMachineStatusChange,
    clearStaleFilter,
  } = useMachinesTable({
    initialUserID: searchParams.get("user_id") || String(user?.id ?? ""),
    initialMachineStatus: searchParams.get("status") || "in_progress",
    initialStaleOnly: (searchParams.get("stale_only") || "").toLowerCase() === "true",
    initialStaleDays,
  });
  const handleClearStaleFilter = () => {
    clearStaleFilter();

    const nextParams = new URLSearchParams();
    nextParams.set("status", "in_progress");
    if (userID) {
      nextParams.set("user_id", userID);
    }

    navigate(`/machines?${nextParams.toString()}`, { replace: true });
  };

  return (
    <div className={styles.machineTableContainer}>
      <TableControls
        userID={userID}
        users={users}
        handleUserChange={handleUserChange}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        machineStatus={machineStatus}
        handleMachineStatusChange={handleMachineStatusChange}
        staleOnly={staleOnly}
        staleDays={staleDays}
        clearStaleFilter={handleClearStaleFilter}
      />
      <MachineList
        machines={machines}
        onSelectMachine={(machineId) => navigate(`/machine/${machineId}`)}
      />
    </div>
  );
};

export default Machines;
