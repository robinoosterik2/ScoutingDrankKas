import { defineStore } from "pinia";
import { useAuthApi } from "~/composables/useAuthApi";
import type { IUser, ILoginCredentials } from "~/types";

export const useAuthStore = defineStore("auth", () => {
  const user = useState<IUser>("auth_user");
  const loading = useState<boolean>("auth_loading", () => false);

  const { login: apiLogin, logout: apiLogout, fetchCurrentUser } = useAuthApi();

  const isLoggedIn = computed(() => !!user.value);

  async function fetchUser() {
    loading.value = true;
    try {
      const { data, error } = await fetchCurrentUser();
      if (error.value) throw error.value;
      user.value = data.value;
    } catch (error) {
      user.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials: ILoginCredentials) {
    loading.value = true;
    try {
      await apiLogin(credentials);
      await fetchUser();
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await apiLogout();
      user.value = null;
      navigateTo("/login");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    isLoggedIn,
    fetchUser,
    login,
    logout,
  };
});
