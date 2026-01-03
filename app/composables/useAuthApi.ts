import type { IUser, ILoginCredentials } from "~/types";

export const useAuthApi = () => {
  const login = (credentials: ILoginCredentials) => {
    return $fetch<IUser>("/api/auth/login", {
      method: "POST",
      body: credentials,
    });
  };

  const logout = () => {
    return $fetch("/api/auth/logout", { method: "POST" });
  };

  const fetchCurrentUser = () => {
    return useFetch<IUser>("/api/auth/me");
  };

  return {
    login,
    logout,
    fetchCurrentUser,
  };
};
