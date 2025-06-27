<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Back to Categories Button -->
    <CTitle
      :text="
        categoryId
          ? $t('categories.editCategory')
          : $t('categories.createCategory')
      "
    />
    <div class="mb-2">
      <BackLink
        to="/admin/categories"
        :back-page="$t('categories.title')"
      />
    </div>

    <!-- Create/Edit Category Form -->
    <form
      class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-xl mx-auto"
      @submit.prevent="saveCategory"
    >
      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          for="categoryName"
        >
          {{ $t("categories.name") }}
        </label>
        <input
          id="categoryName"
          v-model="categoryForm.name"
          type="text"
          required
          class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
        >
        <div id="errorCategoryName" class="text-red-500 text-sm mt-1"/>
      </div>

      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          for="ageRestriction"
        >
          {{ $t("categories.ageRestriction") }}
        </label>
        <div class="flex items-center space-x-3">
          <input
            id="ageRestriction"
            v-model="categoryForm.ageRestriction"
            type="checkbox"
            class="form-checkbox h-6 w-6 text-indigo-600 border-gray-300 rounded-md focus:ring-indigo-500"
          >
          <label
            for="ageRestriction"
            class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {{ $t("categories.ageRestriction") }}
          </label>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          @click="navigateTo('/admin/categories')"
        >
          {{ $t("cancel") }}
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {{
            categoryId
              ? $t("categories.updateCategory")
              : $t("categories.createCategory")
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Get category ID from route
const route = useRoute();
const categoryId = ref(route.params.id || null);

// Form data reactive state
const categoryForm = ref({
  name: "",
  ageRestriction: false,
});

onMounted(async () => {
  if (categoryId.value) {
    try {
      const category = await $fetch(`/api/categories/${categoryId.value}`, {
        method: "GET",
      });
      categoryForm.value = {
        name: category.name,
        ageRestriction: category.ageRestriction,
      };
    } catch (error) {
      console.error("Failed to fetch category:", error);
      alert("Failed to fetch category details. Please try again.");
    }
  }
});

const saveCategory = async () => {
  try {
    if (categoryId.value) {
      await $fetch(`/api/admin/categories/${categoryId.value}`, {
        method: "PUT",
        body: JSON.stringify(categoryForm.value),
      });
    } else {
      await $fetch("/api/admin/categories/create", {
        method: "POST",
        body: JSON.stringify(categoryForm.value),
      });
    }

    navigateTo("/admin/categories");
  } catch (error) {
    console.error("Failed to save category:", error);
    alert(error.message || "Failed to save category. Please try again.");
  }
};
</script>
