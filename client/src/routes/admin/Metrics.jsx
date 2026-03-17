import styles from "./Metrics.module.css";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { formatDate, getToday, shiftDate } from "../../utils/Tools";
import { brands } from "../../utils/Schemas";
import { requestJson } from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faFileCsv,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

const EVENT_LABELS = {
  initiated: "Initiated",
  completed: "Completed",
  trashed: "Trashed",
  reopened: "Reopened",
  archived: "Archived",
  unarchived: "Unarchived",
};

const Metrics = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [params, setParams] = useState({
    start_date: getToday(),
    end_date: getToday(),
    user_id: "",
  });
  const navigate = useNavigate();

  const selectedUser = Boolean(params.user_id);
  const isSingleDay = params.start_date === params.end_date;
  const handleUserChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setMetrics(null);
    }
    setParams((prev) => ({ ...prev, user_id: value }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await requestJson("/api/read/users");
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
    if (!selectedUser) {
      return;
    }

    const fetchMetrics = async () => {
      try {
        const query = new URLSearchParams({
          start_date: params.start_date,
          end_date: params.end_date,
        });
        const data = await requestJson(
          `/api/read/metrics/${params.user_id}?${query.toString()}`,
        );
        setMetrics(data.metrics);
      } catch (error) {
        console.error("[METRICS QUERY ERROR]: ", error);
        toast.error("Failed to load metrics");
        setMetrics(null);
      }
    };

    fetchMetrics();
  }, [params.end_date, params.start_date, params.user_id, selectedUser]);

  const exportReport = async (format) => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    const API_BASE =
      import.meta.env.MODE === "development"
        ? ""
        : import.meta.env.VITE_SERVER_URL || "";
    const url = `${API_BASE}/api/export/user_report/${params.user_id}?start=${params.start_date}&end=${params.end_date}&format=${format}`;

    try {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        let message = "There was an error exporting the report";
        try {
          const err = await response.json();
          message = err.message || message;
        } catch {
          // ignore non-json errors
        }
        toast.error(message);
        return;
      }

      const blob = await response.blob();
      const filename = format === "csv" ? "user_report.csv" : "user_report.pdf";
      const blobURL = window.URL.createObjectURL(blob);

      if (format === "pdf") {
        window.open(blobURL, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobURL;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("[EXPORT ERROR]: ", error);
      toast.error("There was an error exporting the report");
    }
  };

  const countRows = useMemo(() => {
    const counts = metrics?.counts;
    if (!counts) return [];
    return Object.entries(EVENT_LABELS).map(([key, label]) => ({
      key,
      label,
      value: counts[key] ?? 0,
    }));
  }, [metrics]);

  const hasNewMetricsShape = Boolean(
    metrics?.counts && Array.isArray(metrics?.events),
  );

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.metricsHeader}>
        <h1>Metrics</h1>
        <p>Choose a technician and date range to review their activity.</p>
      </div>

      <div className={styles.userSelect}>
        <div className={styles.metricsDateSelect}>
          <div>
            <button
              className={styles.shiftDayButton}
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  start_date: shiftDate(prev.start_date, -1),
                  end_date: shiftDate(prev.end_date, -1),
                }))
              }
              disabled={!isSingleDay}
            >
              prev
            </button>
            <button
              className={styles.todayButton}
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  start_date: getToday(),
                  end_date: getToday(),
                }))
              }
              disabled={
                params.start_date === getToday() &&
                params.end_date === getToday()
              }
            >
              Today
            </button>
            <button
              className={styles.shiftDayButton}
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  start_date: shiftDate(prev.start_date, 1),
                  end_date: shiftDate(prev.end_date, 1),
                }))
              }
              disabled={params.end_date === getToday() || !isSingleDay}
            >
              next
            </button>
          </div>
          <div>
            <label htmlFor="start_date">Start Date</label>
            <input
              id="start_date"
              type="date"
              name="start_date"
              value={params.start_date}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, start_date: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="end_date">End Date</label>
            <input
              id="end_date"
              type="date"
              name="end_date"
              value={params.end_date}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, end_date: e.target.value }))
              }
            />
          </div>
        </div>
        <div>
          <label className={styles.userSelectLabel} htmlFor="userID">
            Technician
          </label>
          <select
            id="userID"
            name="userID"
            value={params.user_id}
            onChange={handleUserChange}
            className={styles.userSelectControl}
          >
            <option value="">--select user--</option>
            {users.map(({ id, first_name, last_name }) => (
              <option value={id} key={id}>
                {first_name} {last_name}
              </option>
            ))}
          </select>
        </div>
        {selectedUser && (
          <div className={styles.exportActions}>
            <button
              className={styles.printMetricsButton}
              onClick={() => exportReport("csv")}
            >
              <span className={styles.exportLabel}>CSV</span>
              <FontAwesomeIcon icon={faFileCsv} />
            </button>
            <button
              className={styles.printMetricsButton}
              onClick={() => exportReport("pdf")}
            >
              <span className={styles.exportLabel}>PDF</span>
              <FontAwesomeIcon icon={faFilePdf} />
            </button>
          </div>
        )}
      </div>

      {metrics && hasNewMetricsShape && (
        <div className={styles.metricsData}>
          <h1 className={styles.metricsTitle}>{metrics.user}</h1>

          <ul className={styles.inProgressMachines}>
            <li>
              <h2>Event Counts</h2>
            </li>
            {countRows.map(({ key, label, value }) => (
              <li key={key}>
                <p>
                  {label}: <small>[{value}]</small>
                </p>
              </li>
            ))}
          </ul>

          <ul className={styles.eventsList}>
            <li>
              <h2>Events</h2>
              <p className={styles.machineListDate}>
                Between {formatDate(params.start_date)} and{" "}
                {formatDate(params.end_date)}
              </p>
            </li>
            {metrics.events.map(
              ({ id, machine_id, event_type, event_date }) => (
                <li key={id}>
                  <p>
                    {EVENT_LABELS[event_type] ?? event_type} on{" "}
                    <small>[{formatDate(event_date)}]</small>
                  </p>
                  <p>
                    machine:<small>[{machine_id}]</small>
                    <span className={styles.iconAction}>
                      <FontAwesomeIcon
                        icon={faEye}
                        onClick={() => navigate(`/machine/${machine_id}`)}
                        className={styles.gotomachine}
                      />
                    </span>
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {metrics && !hasNewMetricsShape && (
        <div className={styles.metricsData}>
          <h1 className={styles.metricsTitle}>{metrics.user}</h1>
          <ul className={styles.inProgressMachines}>
            <li>
              <h2>
                <span>{metrics.in_progress?.count ?? 0}</span> In Progress
              </h2>
            </li>
            {(metrics.in_progress?.machines ?? []).map(
              ({ id, brand, model, serial, form_factor, style }) => (
                <li key={id}>
                  <p>
                    {brands[brand]} {form_factor ?? style}{" "}
                    <span className={styles.iconAction}>
                      <FontAwesomeIcon
                        icon={faEye}
                        onClick={() => navigate(`/machine/${id}`)}
                        className={styles.gotomachine}
                      />
                    </span>
                  </p>
                  <p>
                    model:<small>[{model}]</small>
                  </p>
                  <p>
                    serial:<small>[{serial}]</small>
                  </p>
                </li>
              ),
            )}
          </ul>
          <ul className={styles.completedMachines}>
            <li>
              <h2>
                <span>{metrics.completed?.count ?? 0}</span> Completed
              </h2>
              <p className={styles.machineListDate}>
                Between {formatDate(params.start_date)} and{" "}
                {formatDate(params.end_date)}
              </p>
            </li>
            {(metrics.completed?.machines ?? []).map(
              ({ id, brand, model, serial, form_factor, style }) => (
                <li key={id}>
                  <p>
                    {brands[brand]} {form_factor ?? style}{" "}
                    <span className={styles.iconAction}>
                      <FontAwesomeIcon
                        icon={faEye}
                        onClick={() => navigate(`/machine/${id}`)}
                        className={styles.gotomachine}
                      />
                    </span>
                  </p>
                  <p>
                    model:<small>[{model}]</small>
                  </p>
                  <p>
                    serial:<small>[{serial}]</small>
                  </p>
                </li>
              ),
            )}
          </ul>
          <ul className={styles.trashedMachines}>
            <li>
              <h2>
                <span>{metrics.trashed?.count ?? 0}</span> Trashed
              </h2>
              <p className={styles.machineListDate}>
                Between {formatDate(params.start_date)} and{" "}
                {formatDate(params.end_date)}
              </p>
            </li>
            {(metrics.trashed?.machines ?? []).map(
              ({ id, brand, model, serial, form_factor, style }) => (
                <li key={id}>
                  <p>
                    {brands[brand]} {form_factor ?? style}{" "}
                    <span className={styles.iconAction}>
                      <FontAwesomeIcon
                        icon={faEye}
                        onClick={() => navigate(`/machine/${id}`)}
                        className={styles.gotomachine}
                      />
                    </span>
                  </p>
                  <p>
                    model:<small>[{model}]</small>
                  </p>
                  <p>
                    serial:<small>[{serial}]</small>
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Metrics;
