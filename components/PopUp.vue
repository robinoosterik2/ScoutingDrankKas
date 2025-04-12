<template>
	<Teleport to="body">
		<div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div class="w-full max-w-sm p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
				<h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ title }}</h2>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>
				<div class="flex justify-end mt-4">
					<button
						@click="close"
						class="px-4 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
					>
						{{ $t('OK') }}
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup>
const props = defineProps({
	title: String,
	message: String,
	visible: Boolean
})

const emit = defineEmits(['close'])

const close = () => {
	emit('close')
}
</script>
