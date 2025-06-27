<template>
  <!-- Back to Dashboard Button -->
  <CTitle :text="$t('categories.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :back-page="$t('admin.title')"/>
    <div>
      <DashboardLink
        to="/admin/categories/create"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        :label="$t('categories.createCategory')"
      />
    </div>
  </div>

  <!-- Categories Table -->
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("Name") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("categories.ageRestriction") }}
          </th>
          <th
            class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("actions") }}
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
      >
        <tr
          v-for="category in categories"
          :key="category._id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ category.name }}
            </div>
          </td>
          <td class="px-6 py-4">
            <span
              :class="{
                'text-green-600 dark:text-green-400': category.ageRestriction,
                'text-gray-600 dark:text-gray-400': !category.ageRestriction,
              }"
            >
              {{ category.ageRestriction ? $t("yes") : $t("no") }}
            </span>
          </td>
          <td
            class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
          >
            <button
              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
              @click="editCategory(category)"
            >
              {{ $t("edit") }}
            </button>
            <button
              class="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
              @click="deleteCategory(category)"
            >
              {{ $t("delete") }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="categories.length === 0"
      class="text-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
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
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t("categories.noCategories") }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t("categories.getStarted") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const categories = ref([]);

onMounted(async () => {
  try {
    categories.value = await $fetch("/api/categories/all", { method: "GET" });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    alert("Failed to fetch categories. Please try again.");
  }
});

const editCategory = (category) => {
  navigateTo(`/admin/categories/edit/${category._id}`);
};

const deleteCategory = async (category) => {
  if (!confirm($t("categories.confirmDelete", { name: category.name }))) return;
  try {
    await $fetch(`/api/categories/${category._id}`, { method: "DELETE" });
    categories.value = categories.value.filter((c) => c._id !== category._id);
  } catch (error) {
    console.error("Failed to delete category:", error);
    alert("Failed to delete category. Please try again.");
  }
};
</script>
