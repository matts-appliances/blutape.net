import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMachines, getUsers } from "./machineTableApi";

export const useMachinesTable = ({
  initialUserID = "",
  initialMachineStatus = "in_progress",
  initialStaleOnly = false,
  initialStaleDays = 3,
} = {}) => {
  const [userID, setUserID] = useState(initialUserID);
  const [machineStatus, setMachineStatus] = useState(initialMachineStatus);
  const [machines, setMachines] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [staleOnly, setStaleOnly] = useState(initialStaleOnly);
  const [staleDays] = useState(initialStaleDays);

  const handleUserChange = (e) => {
    setUserID(e.target.value);
    setPage(1);
  };

  const handleMachineStatusChange = (status) => {
    setMachineStatus(status);
    if (status !== "in_progress") {
      setStaleOnly(false);
    }
    setPage(1);
  };

  const clearStaleFilter = () => {
    setMachineStatus("in_progress");
    setStaleOnly(false);
    setPage(1);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data.users);
      } catch (error) {
        console.error("[USER QUERY ERROR]: ", error);
        toast.error("Failed to load users");
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await getMachines({
          userID,
          machineStatus,
          page,
          staleOnly,
          staleDays,
        });
        setMachines(data.machines);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("[MACHINE QUERY ERROR]: ", error);
        toast.error(error.message);
      }
    };
    fetchMachines();
  }, [machineStatus, page, staleDays, staleOnly, userID]);

  return {
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
  };
};
