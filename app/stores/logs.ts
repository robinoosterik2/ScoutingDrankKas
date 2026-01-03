import { defineStore } from "pinia";
import { useLogsApi } from "~/composables/useLogsApi";
import type { ILog } from "~/types";

export const useLogsStore = defineStore("logs", () => {
  const logs = useState<ILog[]>("system_logs", () => []);
  const loading = useState<boolean>("logs_loading", () => false);

  const { fetchLogs: apiFetchLogs } = useLogsApi();

  async function fetchLogs() {
    loading.value = true;
    try {
      const { data, error } = await apiFetchLogs();
      if (error.value) throw error.value;
      if (data.value) {
        logs.value = data.value;
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    logs,
    loading,
    fetchLogs,
  };
});
