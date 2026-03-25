import { requestJson } from "../../../utils/api";

export const getUsers = async () => {
  return requestJson("/api/read/users");
};

export const getMachines = async ({
  userID,
  machineStatus,
  page,
  perPage,
  staleOnly = false,
  staleDays = 3,
}) => {
  const params = new URLSearchParams();

  if (userID) {
    params.set("user_id", userID);
  }

  if (machineStatus) {
    params.set("status", machineStatus);
  }

  if (page) {
    params.set("page", page);
  }

  if (perPage) {
    params.set("per_page", perPage);
  }

  if (staleOnly) {
    params.set("stale_only", "true");
    params.set("stale_days", staleDays);
  }

  return requestJson(`/api/read/machines?${params.toString()}`);
};
