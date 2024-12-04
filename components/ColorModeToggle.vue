<template>
	<button @click="toggleColorMode" class="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white">
		Toggle {{ colorMode }}
	</button>
</template>

<script>
export default {
	computed: {
		colorMode() {
			return this.$colorMode.preference; // Returns 'dark' or 'light'
		},
	},
	methods: {
		toggleColorMode() {
			this.$colorMode.preference = this.colorMode === 'dark' ? 'light' : 'dark';
		},
	},
};
</script>
