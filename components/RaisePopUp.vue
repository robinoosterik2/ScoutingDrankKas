<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
      >
        <button
          @click="close"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="text-center">
          <h3
            class="text-lg font-medium leading-6 text-gray-900 dark:text-white mt-4"
          >
            {{ title }}
          </h3>

          <p class="text-sm text-gray-500 dark:text-gray-300 mt-2">
            {{ message }}
          </p>

          <div class="mt-4">
            <input
              type="number"
              id="amount"
              v-model="raiseAmount"
              class="p-1 mt-2 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter amount"
            />
          </div>

          <div class="mt-5">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {{ $t("raise.lastRases") }}
            </h4>
            <ul class="text-sm text-gray-500 dark:text-gray-300">
              <li v-for="raise in recentRaises" :key="raise._id" class="mb-1">
                <span class="block"
                  >{{ $t("Amount") }}: {{ raise.amount }}</span
                >
                <span class="block"
                  >{{ $t("By") }}:
                  {{ raise.raiser?.username || "Unknown" }}</span
                >
                <span class="block"
                  >{{ $t("On") }}:
                  {{ new Date(raise.createdAt).toLocaleString() }}</span
                >
              </li>
            </ul>
          </div>

          <div class="mt-5 sm:flex sm:flex-row-reverse">
            <button
              @click="confirmRaise"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ $t("raise.raiseBalance") }}
            </button>
            <button
              @click="close"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {{ $t("cancel") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Raise Balance",
    },
    message: {
      type: String,
      default: "Enter the amount to raise the balance for the user.",
    },
    userId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      raiseAmount: null,
      recentRaises: [],
    };
  },
  emits: ["close"],
  methods: {
    async fetchRecentRaises() {
      try {
        console.log(this.userId)
        this.recentRaises = await $fetch(`/api/admin/raises/userRaises`, {
          method: "POST",
          body: {
            userId: this.userId,
            limit: 5,
          },
        });
      } catch (error) {
        console.error("Failed to fetch recent raises", error);
      }
    },
    async confirmRaise() {
      if (!this.raiseAmount || this.raiseAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      try {
        await $fetch(`/api/admin/raises/create`, {
          method: "POST",
          body: {
            userId: this.userId,
            amount: this.raiseAmount,
          },
        });
        this.fetchRecentRaises();
        this.raiseAmount = null;
      } catch (error) {
        console.error("Failed to raise balance", error);
        alert("Failed to raise balance. Please try again. Error: ", error);
      }
    },
    close() {
      this.$emit("close");
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchRecentRaises();
      }
    },
  },
};
</script>
