<template>
  <div class="container mx-auto px-8 py-4">
    <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
      Admin Dashboard
    </h1>
    <BackLink to="/" backPage="Dashboard"></BackLink>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <!-- Roles Management -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 class="text-l font-semibold text-gray-800 dark:text-white">
              Roles Management
            </h2>
          </div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-grow">
          Manage user roles, create new roles, and define permissions
        </p>
        <div class="mt-auto space-y-2">
          <DashboardLink
            to="/admin/roles"
            type="secondary"
            label="View All Roles"
          />
          <DashboardLink
            to="/admin/roles/create"
            type="roles"
            label="Create New Role"
          />
        </div>
      </div>

      <!-- User Management -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h2 class="text-l font-semibold text-gray-800 dark:text-white">
              User Management
            </h2>
          </div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-grow">
          Manage user accounts, reset passwords, and handle user permissions
        </p>
        <div class="mt-auto space-y-2">
          <DashboardLink
            to="/admin/users"
            type="secondary"
            label="View All Users"
          />
          <DashboardLink
            to="/register"
            type="users"
            label="Create New User"
          />
        </div>
      </div>

      <!-- System Logs -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h2 class="text-l font-semibold text-gray-800 dark:text-white">
              System Logs
            </h2>
          </div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-grow">
          Monitor system activities, track user actions, and review error logs
        </p>
        <div class="mt-auto">
          <DashboardLink
            to="/admin/logs"
            type="logs"
            label="View System Logs"
          />
        </div>
      </div>

      <!-- System Settings -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 class="text-l font-semibold text-gray-800 dark:text-white">
              System Settings
            </h2>
          </div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-grow">
          Manage global system configurations, site settings, and application
          parameters
        </p>
        <div class="mt-auto">
          <DashboardLink
            to="/admin/settings"
            type="system"
            label="System Settings"
          />
        </div>
      </div>

      <!-- API Management -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 9l3 3-3 3m5 0h3M5 20a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5zM15 6l3 3-3 3"
              />
            </svg>
            <h2 class="text-l font-semibold text-gray-800 dark:text-white">
              API Management
            </h2>
          </div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-grow">
          Manage API keys, view integrations, and configure external service
          connections
        </p>
        <div class="mt-auto">
          <DashboardLink
            to="/admin/api"
            type="primary"
            label="View API Settings"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import the new DashboardLink component
import DashboardLink from "~/components/DashboardLink.vue";

// Admin middleware protection
definePageMeta({
  // middleware: ["admin"]
});
</script>
