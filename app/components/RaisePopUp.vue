<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800"
      >
        <!-- Close Button -->
        <button
          class="absolute text-gray-500 top-4 right-4 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          @click="close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
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

        <!-- Title & Message -->
        <div class="text-center">
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-300">
            {{ message }}
          </p>

          <!-- Amount Input -->
          <div class="mt-4">
            <input
              id="amount"
              v-model="raiseAmount"
              type="text"
              class="w-full p-2 border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :placeholder="$t('raise.enterAmount')"
            >
          </div>

          <!-- Payment Method Selection -->
          <div class="mt-4">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ $t("raise.paymentMethod") }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                :class="[
                  'py-2 px-4 border rounded-md text-sm font-medium',
                  paymentMethod === 'cash'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600',
                ]"
                @click="paymentMethod = 'cash'"
              >
                {{ $t("raise.cash") }}
              </button>
              <button
                type="button"
                :class="[
                  'py-2 px-4 border rounded-md text-sm font-medium',
                  paymentMethod === 'pin'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600',
                ]"
                @click="paymentMethod = 'pin'"
              >
                {{ $t("raise.pin") }}
              </button>
            </div>
          </div>

          <!-- Last 5 Raises -->
          <div class="mt-5">
            <h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              {{ $t("raise.last5Raises") }}
            </h4>
            <div v-if="recentRaises.length > 0" class="space-y-2">
              <div
                v-for="raise in recentRaises"
                :key="raise._id"
                class="p-3 bg-gray-100 rounded-lg shadow-sm dark:bg-gray-700"
              >
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {{ $t("Amount") }}: {{ format(raise.amount) }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ $t("By") }}:
                  {{
                    raise.raiser?.firstName + " " + raise.raiser?.lastName ||
                    $t("Unknown")
                  }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ $t("On") }}:
                  {{
                    new Date(raise.createdAt).toLocaleString("nl-nl", {
                      hour12: false,
                    })
                  }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t("raise.noRaisesFound") }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="mt-5 sm:flex sm:flex-row-reverse">
            <button
              class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="confirmRaise"
            >
              {{ $t("raise.raiseBalance") }}
            </button>
            <button
              class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              @click="close"
            >
              {{ $t("cancel") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const { format } = useMoney();
</script>

<script>
const { parse } = useMoney();
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
      type: [String, null],
      required: true,
    },
  },
  emits: ["balanceUpdated", "close"],
  emits: ["close"],
  data() {
    return {
      raiseAmount: null,
      paymentMethod: "cash", // Default to cash
      recentRaises: [],
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.fetchRecentRaises();
      }
    },
  },
  methods: {
    async fetchRecentRaises() {
      try {
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
        const amount = parse(this.raiseAmount);
        const response = await $fetch(`/api/admin/raises/create`, {
          method: "POST",
          body: {
            userId: this.userId,
            amount: amount,
            paymentMethod: this.paymentMethod,
          },
        });
        this.fetchRecentRaises();
        this.raiseAmount = null;
        this.paymentMethod = "cash"; // Reset to default
        // Emit event with the updated balance
        this.$emit("balanceUpdated", {
          userId: this.userId,
          newBalance: response.newBalance,
        });
      } catch (error) {
        console.error("Failed to raise balance", error);
        const statusMessage =
          (error && typeof error === "object" && "data" in error && error.data && error.data.statusMessage) ||
          (error instanceof Error ? error.message : "");
        const i18nKey =
          error && typeof error === "object" && "data" in error && error.data && typeof error.data.i18nKey === "string"
            ? error.data.i18nKey
            : null;
        const canTranslate =
          !!(
            i18nKey &&
            this.$i18n &&
            typeof this.$i18n.te === "function" &&
            this.$i18n.te(i18nKey)
          );
        const translatedMessage =
          (canTranslate && this.$t(i18nKey)) ||
          (statusMessage && statusMessage.length > 0 ? statusMessage : this.$t("raise.errors.unknown"));
        alert(this.$t("raise.errors.raiseFailedWithReason", { reason: translatedMessage }));
      }
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>
