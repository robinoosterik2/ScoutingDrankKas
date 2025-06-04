import { ref, onMounted, type Ref } from 'vue'; // Import Ref

// Define and export types for User and Role.

/**
 * Represents the structure of a user's role when populated.
 */
export interface UserRole {
  _id: string;
  roleName: string;
}

/**
 * Represents a user object, typically fetched from the API.
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: string | number;
  role: UserRole | string | null; // Role could be populated object, an ID string, or null
  active: boolean;
  // Add other user fields as necessary, e.g., createdAt, updatedAt
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Represents a user role object.
 */
export interface Role {
  _id: string;
  roleName: string;
  // Add other role fields as necessary, e.g., permissions: string[];
}

/**
 * Defines the structure of the object returned by the `useAdminUsers` composable.
 */
interface UseAdminUsersReturn {
  /** Ref<User[]> - Reactive array of users. */
  users: Ref<User[]>;
  /** Ref<Role[]> - Reactive array of roles. */
  roles: Ref<Role[]>;
  /** Ref<boolean> - True if users are currently being fetched. */
  isLoadingUsers: Ref<boolean>;
  /** Ref<boolean> - True if roles are currently being fetched. */
  isLoadingRoles: Ref<boolean>;
  /** Ref<Error | null> - Stores any error that occurred while fetching users. */
  usersError: Ref<Error | null>;
  /** Ref<Error | null> - Stores any error that occurred while fetching roles. */
  rolesError: Ref<Error | null>;
  /** Function to manually trigger fetching of all users. */
  fetchUsers: () => Promise<void>;
  /** Function to manually trigger fetching of all roles. */
  fetchRoles: () => Promise<void>;
  /** Function to re-fetch the list of users. Typically called after an update or deletion. */
  refetchUsers: () => Promise<void>;
}

/**
 * Composable function for fetching and managing administrative user and role data.
 * It automatically fetches users and roles when mounted.
 * Provides reactive refs for users, roles, loading states, and error states.
 * Also exposes functions to manually fetch or refetch data.
 * @returns {UseAdminUsersReturn} An object containing reactive data and control functions.
 */
export function useAdminUsers(): UseAdminUsersReturn {
  const users = ref<User[]>([]);
  const roles = ref<Role[]>([]);
  const isLoadingUsers = ref<boolean>(false);
  const isLoadingRoles = ref<boolean>(false);
  const usersError = ref<Error | null>(null);
  const rolesError = ref<Error | null>(null);

  const fetchUsers = async (): Promise<void> => {
    isLoadingUsers.value = true;
    usersError.value = null;
    try {
      // Assuming $fetch is globally available, otherwise it needs to be imported or passed
      const data = await $fetch<User[]>("/api/users/all", { method: "GET" });
      users.value = data;
    } catch (e) { // Explicitly type error if possible, otherwise 'unknown' or 'any'
      usersError.value = e as Error; // Type assertion
      console.error("Failed to fetch users:", e);
    } finally {
      isLoadingUsers.value = false;
    }
  };

  const fetchRoles = async (): Promise<void> => {
    isLoadingRoles.value = true;
    rolesError.value = null;
    try {
      const data = await $fetch<Role[]>("/api/roles/all", { method: "GET" });
      roles.value = data;
    } catch (e) {
      rolesError.value = e as Error; // Type assertion
      console.error("Failed to fetch roles:", e);
    } finally {
      isLoadingRoles.value = false;
    }
  };

  const refetchUsers = async (): Promise<void> => {
    await fetchUsers();
  };

  // Fetch data when the composable is first used
  onMounted(async () => {
    // Using Promise.all to fetch concurrently, though not strictly necessary here
    await Promise.all([fetchUsers(), fetchRoles()]);
  });

  return {
    users,
    roles,
    isLoadingUsers,
    isLoadingRoles,
    usersError,
    rolesError,
    fetchUsers, // Exposing fetchUsers directly if needed, otherwise refetchUsers might be sufficient
    fetchRoles, // Exposing fetchRoles directly if needed
    refetchUsers,
  };
}
