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
          <DashboardLink to="/register" type="users" label="Create New User" />
        </div>
      </div>

      <!-- Product Management -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-purple-600"
              viewBox="0 0 32 32"
              xml:space="preserve"
              stroke="currentColor"
            >
              <path
                d="M13.643 10.312c-.084 0-.16-.012-.237-.024a2.72 2.72 0 0 1-.044.662h8.892v14.68a3.6 3.6 0 0 1-3.601 3.601H9.361A3.6 3.6 0 0 1 5.76 25.63V10.95h.411a1.255 1.255 0 0 1-.225-.441 1.252 1.252 0 0 1-.46-.22c-.071.01-.14.022-.218.022-.121 0-.233-.014-.337-.037a.44.44 0 0 0-.07.226v15.13a4.5 4.5 0 0 0 4.5 4.5h9.292a4.5 4.5 0 0 0 4.5-4.5V10.103c-3.119.25-6.339.214-9.51.209z"
              />
              <path
                d="M22.763 26.319h-.059a.45.45 0 0 1-.45-.45V13.956a.45.45 0 0 1 .45-.45h2.085a4.207 4.207 0 0 1 4.202 4.202v2.382a6.236 6.236 0 0 1-6.228 6.229zm.391-11.913v11a5.337 5.337 0 0 0 4.938-5.315v-2.382a3.306 3.306 0 0 0-3.303-3.303h-1.635zM10.622 2.768c1.063 0 2.051.515 2.642 1.379a1.456 1.456 0 0 0 2.01.389 2.47 2.47 0 0 1 1.373-.414c.902 0 1.736.491 2.175 1.281a1.486 1.486 0 0 0 1.71.708 2.075 2.075 0 0 1 .726-.078 2.094 2.094 0 0 1 1.922 1.932 2.055 2.055 0 0 1-.557 1.55 2.05 2.05 0 0 1-1.508.652l-.683-.003-7.822-.03h-.003a.9.9 0 0 0-.899.899v1.76c0 .347-.283.63-.63.63H10.8a.631.631 0 0 1-.63-.63v-1.769a.9.9 0 0 0-.896-.899l-4.06-.014a1.517 1.517 0 0 1-1.051-.659 1.536 1.536 0 0 1-.189-1.298c.167-.588.685-.999 1.319-1.049a1.43 1.43 0 0 1 .534.057c.12.036.245.054.373.054.446 0 .861-.219 1.084-.572.155-.245.205-.536.147-.816.055-1.696 1.465-3.06 3.191-3.06m0-.899c-2.243 0-4.092 1.819-4.092 4.062v.019c.101.211-.116.367-.33.367a.416.416 0 0 1-.116-.016 2.316 2.316 0 0 0-.862-.092c-.994.078-1.84.74-2.113 1.699a2.42 2.42 0 0 0 2.048 3.102l4.114.014v1.769a1.53 1.53 0 0 0 1.529 1.529h.278c.844 0 1.529-.684 1.529-1.529v-1.76l9.956.033c.451 0-.569-.101-.186-.281a2.969 2.969 0 0 0 1.7-2.876 2.981 2.981 0 0 0-2.963-2.78c-.29 0-.571.042-.836.119a.587.587 0 0 1-.671-.282 3.383 3.383 0 0 0-4.832-1.179.559.559 0 0 1-.77-.148 4.109 4.109 0 0 0-3.383-1.77zM9.5 26.181a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 1 0v10a.5.5 0 0 1-.5.5zM12.5 26.181a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 1 0v10a.5.5 0 0 1-.5.5zM15.5 26.181a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 1 0v10a.5.5 0 0 1-.5.5zM18.5 26.181a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 1 0v10a.5.5 0 0 1-.5.5z"
              />
            </svg>
            <h2 class="text-l font-semibold text-gray-800 dark:text-white">
              Product Management
            </h2>
          </div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-grow">
          Manage product, create new products, and update product
          details
        </p>
        <div class="mt-auto space-y-2">
        <DashboardLink
            to="/admin/products"
            type="secondary"
            label=
            "View All Products"
          />
          <DashboardLink
            to="/admin/products/create"
            type="products"
            label="Create New Product"
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
