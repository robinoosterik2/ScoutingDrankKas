<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold dark:text-white">
        {{ $t("guests.title") }}
      </h1>
      <button
        @click="openCreateModal"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        {{ $t("guests.createGuest") }}
      </button>
    </div>

    <!-- Guest List -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {{ $t("username") }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {{ $t("users.name") }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {{ $t("guests.totalSpent") }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {{ $t("users.accountStatus") }}
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
          <tr v-for="guest in guests" :key="guest.id">
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
            >
              {{ guest.username }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
            >
              {{ guest.firstName }} {{ guest.lastName }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium"
            >
              {{ format(guest.balance) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  guest.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{
                  guest.active
                    ? $t("users.status.active")
                    : $t("users.status.inactive")
                }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="resetGuest(guest)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                {{ $t("guests.reset") }}
              </button>
              <button
                @click="deleteGuest(guest)"
                class="text-red-600 hover:text-red-900"
              >
                {{ $t("delete") }}
              </button>
            </td>
          </tr>
          <tr v-if="guests.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
              {{ $t("guests.noGuests") }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 class="text-xl font-bold mb-4 dark:text-white">
          {{ $t("guests.createGuest") }}
        </h2>
        <form @submit.prevent="createGuest">
          <div class="mb-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("username") }}</label
            >
            <input
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div class="mb-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("users.firstName") }}</label
            >
            <input
              v-model="form.firstName"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div class="mb-6">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("users.lastName") }}</label
            >
            <input
              v-model="form.lastName"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              @click="closeModal"
              class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {{ $t("cancel") }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {{ $t("create") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const { format } = useMoney();

const guests = ref([]);
const showModal = ref(false);
const form = ref({ username: "", firstName: "", lastName: "" });

const fetchGuests = async () => {
  try {
    guests.value = await $fetch("/api/guests");
  } catch (e) {
    console.error(e);
  }
};

const openCreateModal = () => {
  form.value = { username: "", firstName: "", lastName: "" };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const createGuest = async () => {
  try {
    await $fetch("/api/guests/create", {
      method: "POST",
      body: form.value,
    });
    closeModal();
    fetchGuests();
  } catch (e) {
    alert(e.data?.message || "Failed to create guest");
  }
};

const resetGuest = async (guest) => {
  if (!confirm(t("guests.resetConfirm"))) return;
  try {
    await $fetch(`/api/guests/${guest.id}/reset`, { method: "POST" });
    fetchGuests();
  } catch (e) {
    alert("Failed to reset");
  }
};

const deleteGuest = async (guest) => {
  if (!confirm(t("guests.deleteConfirm"))) return;
  try {
    await $fetch(`/api/guests/delete`, {
      method: "POST",
      body: { guestId: guest.id },
    });
    fetchGuests();
  } catch (e) {
    alert("Failed to delete");
  }
};

onMounted(() => {
  fetchGuests();
});
</script>
