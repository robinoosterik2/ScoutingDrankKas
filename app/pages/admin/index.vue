<template>
  <CTitle :text="$t('admin.title')" />
  <div class="mb-2">
    <BackLink to="/" :back-page="$t('dashboard.title')"/>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    <!-- Roles Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-indigo-600"
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
      </template>
      <template #title>{{ $t("admin.rolesManagement") }}</template>
      <template #description>{{
        $t("admin.RolesManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/roles"
          type="secondary"
          :label="$t('admin.viewAllRoles')"
        />
        <DashboardLink
          to="/admin/roles/create"
          type="roles"
          :label="$t('admin.createRole')"
        />
      </template>
    </AdminCard>

    <!-- User Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-green-600"
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
      </template>
      <template #title>{{ $t("admin.UserManagement") }}</template>
      <template #description>{{
        $t("admin.UserManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/users"
          type="secondary"
          :label="$t('admin.viewAllUsers')"
        />
      </template>
    </AdminCard>

    <!-- Product Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-purple-600"
          viewBox="0 0 32 32"
          xml:space="preserve"
          stroke="currentColor"
        >
          <path
            d="M13.643 10.312c-.084 0-.16-.012-.237-.024a2.72 2.72 0 0 1-.044.662h8.892v14.68a3.6 3.6 0 0 1-3.601 3.601H9.361A3.6 3.6 0 0 1 5.76 25.63V10.95h.411a1.255 1.255 0 0 1-.225-.441 1.252 1.252 0 0 1-.46-.22c-.071.01-.14.022-.218.022-.121 0-.233-.014-.337-.037a.44.44 0 0 0-.07.226v15.13a4.5 4.5 0 0 0 4.5 4.5h9.292a4.5 4.5 0 0 0 4.5-4.5V10.103c-3.119.25-6.339.214-9.51.209z"
          />
        </svg>
      </template>
      <template #title>{{ $t("admin.productManagement") }}</template>
      <template #description>{{
        $t("admin.ProductManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/products"
          type="secondary"
          :label="$t('admin.viewAllProducts')"
        />
        <DashboardLink
          to="/admin/products/create"
          type="products"
          :label="$t('admin.createProduct')"
        />
      </template>
    </AdminCard>

    <!-- Category Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-pink-600"
          viewBox="0 0 24 24"
          xml:space="preserve"
        >
          <path
            fill="currentColor"
            d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1M9 9H5V5h4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m-1 6h-4V5h4zm-9 4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1m-1 6H5v-4h4zm8-6c-2.206 0-4 1.794-4 4s1.794 4 4 4s4-1.794 4-4s-1.794-4-4-4m0 6c-1.103 0-2-.897-2-2s.897-2 2-2s2 .897 2 2s-.897 2-2 2"
          />
        </svg>
      </template>
      <template #title>{{ $t("admin.categoryManagement") }}</template>
      <template #description>{{
        $t("admin.CategoryManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/categories"
          type="secondary"
          :label="$t('admin.viewAllCategories')"
        />
        <DashboardLink
          to="/admin/categories/create"
          type="categories"
          :label="$t('admin.createCategory')"
        />
      </template>
    </AdminCard>

    <!-- Finance Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </template>
      <template #title>{{ $t("admin.financeManagement") }}</template>
      <template #description>{{
        $t("admin.FinanceManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/finances"
          type="secondary"
          :label="$t('admin.viewAllFinances')"
        />
        <DashboardLink
          to="/admin/finances/create"
          type="finances"
          :label="$t('admin.createTransaction')"
        />
      </template>
    </AdminCard>

    <!-- Orders Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7h18M3 12h18M3 17h18"
          />
        </svg>
      </template>
      <template #title>{{ $t("admin.ordersManagement") }}</template>
      <template #description>{{
        $t("admin.OrdersManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/orders"
          type="secondary"
          :label="$t('admin.viewAllOrders')"
        />
      </template>
    </AdminCard>
    <!-- Log Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-red-600"
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
      </template>
      <template #title>{{ $t("admin.logsManagement") }}</template>
      <template #description>{{
        $t("admin.LogsManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/logs"
          type="secondary"
          :label="$t('admin.viewAllLogs')"
        />
        <DashboardLink
          to="/admin/logs/export"
          type="logs"
          :label="$t('admin.exportLogs')"
        />
      </template>
    </AdminCard>

    <!-- Purchases Management -->
    <AdminCard>
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 min-h-8 min-w-8 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </template>
      <template #title>{{ $t("admin.purchasesManagement") }}</template>
      <template #description>{{
        $t("admin.PurchasesManagementDescription")
      }}</template>
      <template #links>
        <DashboardLink
          to="/admin/purchases"
          type="secondary"
          :label="$t('admin.viewAllPurchases')"
        />
      </template>
    </AdminCard>
  </div>
</template>

<script setup>
// Import the AdminCard component
import AdminCard from "~/components/AdminCard.vue";
</script>
