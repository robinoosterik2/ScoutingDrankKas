import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAdminUsers, type User, type Role } from '~/composables/useAdminUsers';
import { ref } from 'vue';

// Mock onMounted: For this test, we'll call fetch methods directly after initializing the composable
// as onMounted might not behave the same way outside a Vue component lifecycle in a pure unit test.
// A more integrated test might use @vue/test-utils to mount a dummy component.
// However, since fetchUsers and fetchRoles are returned, we can test them.
// Or, we can rely on the fact that useAdminUsers() call will trigger onMounted's callback if run in a Nuxt/Vue context.
// For Vitest with Nuxt, Nuxt's test utils often set up the right environment.

// Mock global $fetch
const mockUsers: User[] = [
  { _id: '1', username: 'user1', email: 'u1@example.com', firstName: 'User', lastName: 'One', balance: 100, role: { _id: 'r1', roleName: 'Admin' }, active: true },
  { _id: '2', username: 'user2', email: 'u2@example.com', firstName: 'User', lastName: 'Two', balance: 50, role: { _id: 'r2', roleName: 'Stam' }, active: true },
];
const mockRoles: Role[] = [
  { _id: 'r1', roleName: 'Admin' },
  { _id: 'r2', roleName: 'Stam' },
];

const mockFetch = vi.fn();
globalThis.$fetch = mockFetch;


describe('useAdminUsers Composable', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Reset refs if they were mutated directly (though composables usually re-initialize)
  });

  it('initial state is correct', () => {
    const { users, roles, isLoadingUsers, isLoadingRoles, usersError, rolesError } = useAdminUsers();
    // Note: onMounted will be called here. If $fetch is not yet mocked for this specific call, it might error or return undefined.
    // For initial state *before* onMounted, this test structure is tricky without more control over onMounted.
    // Let's assume onMounted fires and we test the state *after* its attempt.

    expect(users.value).toEqual([]);
    expect(roles.value).toEqual([]);
    expect(isLoadingUsers.value).toBe(false); // Will be true then false if onMounted runs
    expect(isLoadingRoles.value).toBe(false); // Similar
    expect(usersError.value).toBeNull();
    expect(rolesError.value).toBeNull();
  });

  it('fetches users and roles successfully on mount', async () => {
    mockFetch
      .mockResolvedValueOnce([...mockUsers]) // First call for fetchUsers
      .mockResolvedValueOnce([...mockRoles]); // Second call for fetchRoles

    const { users, roles, isLoadingUsers, isLoadingRoles, usersError, rolesError } = useAdminUsers();

    // Wait for onMounted effects. Nuxt Vitest setup might handle this automatically.
    // Or use await nextTick() if that were part of this environment.
    // For now, let's assume promises resolve. Vitest might need `await vi.dynamicImportSettled()` or similar for top-level awaits in setup.
    // A simple way to wait for promises from onMounted:
    await new Promise(resolve => setTimeout(resolve, 0)); // Allow microtasks to run

    expect(isLoadingUsers.value).toBe(false); // Should have completed
    expect(isLoadingRoles.value).toBe(false); // Should have completed
    expect(users.value).toEqual(mockUsers);
    expect(roles.value).toEqual(mockRoles);
    expect(usersError.value).toBeNull();
    expect(rolesError.value).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith("/api/users/all", { method: "GET" });
    expect(mockFetch).toHaveBeenCalledWith("/api/roles/all", { method: "GET" });
  });

  it('handles user fetching failure', async () => {
    const userFetchError = new Error('Failed to fetch users');
    mockFetch
      .mockRejectedValueOnce(userFetchError) // First call for fetchUsers fails
      .mockResolvedValueOnce([...mockRoles]);   // Roles fetch successfully

    const { users, roles, isLoadingUsers, usersError, rolesError } = useAdminUsers();
    await new Promise(resolve => setTimeout(resolve, 0));


    expect(isLoadingUsers.value).toBe(false);
    expect(users.value).toEqual([]);
    expect(usersError.value).toBe(userFetchError);

    // Roles should still be fetched
    expect(roles.value).toEqual(mockRoles);
    expect(rolesError.value).toBeNull();
  });

  it('handles role fetching failure', async () => {
    const roleFetchError = new Error('Failed to fetch roles');
    mockFetch
      .mockResolvedValueOnce([...mockUsers]) // Users fetch successfully
      .mockRejectedValueOnce(roleFetchError);   // Roles fetch fails

    const { users, roles, isLoadingRoles, usersError, rolesError } = useAdminUsers();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(isLoadingRoles.value).toBe(false);
    expect(roles.value).toEqual([]);
    expect(rolesError.value).toBe(roleFetchError);

    // Users should still be fetched
    expect(users.value).toEqual(mockUsers);
    expect(usersError.value).toBeNull();
  });

  it('refetchUsers works correctly', async () => {
    // Initial fetch (onMounted)
    mockFetch
      .mockResolvedValueOnce([]) // Initial users
      .mockResolvedValueOnce([]); // Initial roles

    const { users, refetchUsers, isLoadingUsers, usersError } = useAdminUsers();
    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for onMounted

    expect(users.value).toEqual([]);

    // Mock for refetch
    const updatedMockUsers = [{ ...mockUsers[0], username: 'updatedUser1' }];
    mockFetch.mockResolvedValueOnce(updatedMockUsers); // For the refetchUsers call

    await refetchUsers();

    expect(isLoadingUsers.value).toBe(false);
    expect(users.value).toEqual(updatedMockUsers);
    expect(usersError.value).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial users, initial roles, refetch users
    // The last call should be for users
    expect(mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0]).toBe("/api/users/all");
  });
});
