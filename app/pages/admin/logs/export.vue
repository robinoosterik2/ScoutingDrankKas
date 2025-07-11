<template>
	<CTitle :text="$t('logs.export')" />

	<div class="flex justify-between items-center mb-4">
		<BackLink to="/admin" :back-page="$t('admin.title')" />
	</div>

	<div class="space-y-6">
		<!-- Date Range Card -->
		<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('dateRange') }}</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('startDate') }}</label>
					<input
						v-model="startDate"
						type="date"
						class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
					>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('endDate') }}</label>
					<input
						v-model="endDate"
						type="date"
						class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
					>
				</div>
			</div>
		</div>

		<!-- User Selection Card -->
		<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('userSelection') }}</h3>
			<div class="space-y-4">
				<div class="flex items-center">
					<input
						id="allUsers"
						v-model="userFilter"
						type="radio"
						value="all"
						class="h-5 w-5 text-indigo-600 bg-white dark:bg-red-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
					>
					<label for="allUsers" class="ml-2 text-sm text-red-700 dark:text-gray-300">
						{{ $t('allUsers') }}
					</label>
				</div>

				<div class="flex items-center">
					<input
						id="selectedUsers"
						v-model="userFilter"
						type="radio"
						value="selected"
						class="h-5 w-5 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
					>
					<label for="selectedUsers" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
						{{ $t('selectedUsers') }}
					</label>
				</div>

				<div v-if="userFilter === 'selected'" class="pl-6 space-y-2">
					<input
						v-model="userSearchQuery"
						type="text"
						:placeholder="$t('searchUsers')"
						class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
					>

					<div class="max-h-48 overflow-y-auto border dark:border-gray-700 rounded-md">
						<div v-if="filteredUsers.length === 0" class="p-2 text-gray-500 dark:text-gray-400 text-sm">
							{{ $t('noUsersFound') }}
						</div>
						<div
							v-for="user in filteredUsers"
							:key="user._id"
							class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<input
								:id="'user-' + user._id"
								v-model="selectedUsers"
								type="checkbox"
								:value="user._id"
								class="h-5 w-5 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
							>
							<label :for="'user-' + user._id" class="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">
								{{ user.username }} ({{ user.email }})
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions Card -->
		<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('actions') }}</h3>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
				<div v-for="action in availableActions" :key="action" class="flex items-center">
					<input
						:id="'action-' + action"
						v-model="selectedActions"
						type="checkbox"
						:value="action"
						class="h-5 w-5 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
					>
					<label :for="'action-' + action" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
						{{ action }}
					</label>
				</div>
			</div>
		</div>

		<!-- Export Format Card -->
		<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('exportFormat') }}</h3>
			<div class="flex space-x-6">
				<div class="flex items-center">
					<input
						id="formatCSV"
						v-model="exportFormat"
						type="radio"
						value="csv"
						class="h-5 w-5 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
					>
					<label for="formatCSV" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
						CSV
					</label>
				</div>
				<div class="flex items-center">
					<input
						id="formatJSON"
						v-model="exportFormat"
						type="radio"
						value="json"
						class="h-5 w-5 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
					>
					<label for="formatJSON" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
						JSON
					</label>
				</div>
			</div>
		</div>

		<!-- Submit -->
		<div class="flex justify-end">
			<button
				type="submit"
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				:disabled="isLoading"
				@click.prevent="exportLogs"
			>
				<span v-if="isLoading" class="mr-2">
					<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
						<path
class="opacity-75" fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
				</span>
				{{ $t('exportLogs') }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BackLink from '@/components/BackLink.vue';
import CTitle from '@/components/CTitle.vue';

const { t } = useI18n();

const startDate = ref('');
const endDate = ref('');
const userFilter = ref('all');
const selectedUsers = ref([]);
const selectedActions = ref([]);
const exportFormat = ref('csv');
const isLoading = ref(false);
const userSearchQuery = ref('');
const users = ref([]);
const availableActions = ref(['Create', 'Update', 'Delete', 'Sold', 'Raise', 'Login']);

onMounted(() => {
	const today = new Date();
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(today.getDate() - 30);
	endDate.value = formatDate(today);
	startDate.value = formatDate(thirtyDaysAgo);
	fetchUsers();
});

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

async function fetchUsers() {
	try {
		users.value = await $fetch('/api/users/all', { method: 'GET' });
	} catch (error) {
		console.error('Failed to fetch users:', error);
	}
}

const filteredUsers = computed(() => {
	if (!userSearchQuery.value) return users.value;
	const query = userSearchQuery.value.toLowerCase();
	return users.value.filter(user =>
		user.username.toLowerCase().includes(query) ||
		user.email.toLowerCase().includes(query) ||
		user.firstName.toLowerCase().includes(query) ||
		user.lastName.toLowerCase().includes(query)
	);
});

async function exportLogs() {
	isLoading.value = true;
	try {
		const params = new URLSearchParams();
		params.append('startDate', startDate.value);
		params.append('endDate', endDate.value);
		params.append('format', exportFormat.value);

		if (userFilter.value === 'selected' && selectedUsers.value.length > 0) {
			selectedUsers.value.forEach(userId => params.append('users', userId));
		}

		if (selectedActions.value.length > 0) {
			selectedActions.value.forEach(action => params.append('actions', action));
		}

		const response = await fetch(`/api/admin/log/export?${params.toString()}`, { method: 'GET' });
		if (!response.ok) throw new Error(`Failed to export logs: ${response.statusText}`);

		const blob = await response.blob();
		const dateStr = new Date().toISOString().split('T')[0];
		const filename = `logs_export_${dateStr}.${exportFormat.value}`;
		const url = window.URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		a.remove();
	} catch (error) {
		console.error('Failed to export logs:', error);
		alert(t('exportFailed'));
	} finally {
		isLoading.value = false;
	}
}
</script>
