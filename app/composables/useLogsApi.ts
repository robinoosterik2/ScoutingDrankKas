import type { ILog } from "~/types";

export const useLogsApi = () => {
  const fetchLogs = () => {
    return useFetch<ILog[]>("/api/logs");
  };

  return {
    fetchLogs,
  };
};
