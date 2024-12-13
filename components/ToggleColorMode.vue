<script setup>
import { ref, onMounted, watch } from "vue";

const isDarkMode = ref(false);
const { $colorMode } = useNuxtApp();

onMounted(() => {
	isDarkMode.value = $colorMode.preference === "dark";
});

// Watch for changes in the mode and update color mode
watch(isDarkMode, (newValue) => {
	$colorMode.preference = newValue ? "dark" : "light";
});

const toggleDarkMode = () => {
	isDarkMode.value = !isDarkMode.value;
};
</script>

<template>
	<div
		class="flex items-center space-x-3 group cursor-pointer"
		@click="toggleDarkMode"
	>
		<div
			class="relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-all duration-300 ease-in-out"
			:class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
		>
			<div
				class="absolute flex items-center justify-between w-full px-1 transition-all duration-300"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-4 h-4 text-yellow-500 transition-all duration-300"
				>
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="0" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="24" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="0" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="24" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-4 h-4 text-indigo-600 transition-all duration-300"
				>
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
				</svg>
			</div>
			<div
				class="absolute w-5 h-5 bg-white dark:bg-gray-300 rounded-full shadow-md transform transition-all duration-300"
				:class="isDarkMode ? '-translate-x-3' : 'translate-x-3'"
			/>
		</div>
	</div>
</template>

<style scoped>
/* Hover and focus effects */
.group:hover {
	opacity: 0.8;
}
</style>
