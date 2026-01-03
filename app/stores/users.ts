import { defineStore } from "pinia";
import { useUsersApi } from "~/composables/useUsersApi";
import type { IUser } from "~/types";

export const useUsersStore = defineStore("users", () => {
  const users = useState<IUser[]>("users_list", () => []);
  const loading = useState<boolean>("users_loading", () => false);

  const {
    fetchUsers: apiFetchUsers,
    createUser: apiCreateUser,
    updateUser: apiUpdateUser,
    deleteUser: apiDeleteUser,
  } = useUsersApi();

  async function fetchUsers() {
    loading.value = true;
    try {
      const { data, error } = await apiFetchUsers();
      if (error.value) throw error.value;
      if (data.value) {
        users.value = data.value;
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createUser(userData: Partial<IUser>) {
    loading.value = true;
    try {
      const newUser = await apiCreateUser(userData);
      users.value.push(newUser);
      return newUser;
    } catch (error) {
      console.error("Failed to create user", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id: string, updates: Partial<IUser>) {
    loading.value = true;
    try {
      const updatedUser = await apiUpdateUser(id, updates);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id: string) {
    loading.value = true;
    try {
      await apiDeleteUser(id);
      users.value = users.value.filter((u) => u.id !== id);
    } catch (error) {
      console.error("Failed to delete user", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
});
