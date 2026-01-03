import type { IUser } from "~/types";

export const useUsersApi = () => {
  const fetchUsers = () => {
    return useFetch<IUser[]>("/api/users");
  };

  const createUser = (userData: Partial<IUser>) => {
    return $fetch<IUser>("/api/users", {
      method: "POST",
      body: userData,
    });
  };

  const updateUser = (id: string, updates: Partial<IUser>) => {
    return $fetch<IUser>(`/api/users/${id}`, {
      method: "PUT",
      body: updates,
    });
  };

  const deleteUser = (id: string) => {
    return $fetch(`/api/users/${id}`, { method: "DELETE" });
  };

  return {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
