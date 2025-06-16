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
					@click="close"
					class="absolute text-gray-500 top-4 right-4 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
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
							type="number"
							id="amount"
							v-model="raiseAmount"
							class="w-full p-2 border-gray-300 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							:placeholder="$t('raise.enterAmount')"
						/>
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
									{{ $t("Amount") }}: €<span class="font-bold">{{ raise.amount }}</span>
								</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ $t("By") }}: {{ raise.raiser?.firstName + ' ' + raise.raiser?.lastName || $t("Unknown") }}
                </p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{{ $t("On") }}: {{ new Date(raise.createdAt).toLocaleString() }}
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
							@click="confirmRaise"
							class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
						>
							{{ $t("raise.raiseBalance") }}
						</button>
						<button
							@click="close"
							class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
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
	emits: ['balanceUpdated', 'close'],
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
				const response = await $fetch(`/api/admin/raises/create`, {
					method: "POST",
					body: {
						userId: this.userId,
						amount: this.raiseAmount,
					},
				});
				this.fetchRecentRaises();
				this.raiseAmount = null;
				// Emit event with the updated balance
				this.$emit('balanceUpdated', { userId: this.userId, newBalance: response.newBalance });
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
