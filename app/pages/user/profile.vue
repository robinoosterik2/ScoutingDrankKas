<template>
    <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold mb-6">{{ $t('profile.title') }}</h1>

        <!-- Balance Card -->
        <div v-if="balance !== null" class="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 class="text-xl font-semibold">{{ $t('profile.balance') }}: <span class="text-green-600">€{{ balance }}</span></h2>
        </div>

        <!-- Recent Orders -->
        <div v-if="recentOrders.length" class="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 class="text-xl font-semibold mb-4">{{ $t('profile.recentOrders') }}</h2>
            <ul class="divide-y divide-gray-200">
                <li v-for="order in recentOrders" :key="order._id" class="py-2">
                    <span class="font-medium">{{ formatDate(order.createdAt) }}</span> - <span class="text-green-600">€{{ order.total }}</span>
                </li>
            </ul>
        </div>

        <!-- Order History -->
        <div v-if="orderHistory.length" class="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 class="text-xl font-semibold mb-4">{{ $t('profile.orderHistory') }}</h2>
            <ul class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <li v-for="month in orderHistory" :key="month.month" class="cursor-pointer bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition" @click="loadOrders(month.month, month.year)">
                    {{ month.month }}/{{ month.year }}
                </li>
            </ul>
        </div>

        <!-- Orders of Selected Month -->
        <div v-if="monthlyOrders.length" class="bg-white shadow-md rounded-lg p-4">
            <h2 class="text-xl font-semibold mb-4">{{ $t('profile.ordersOfMonth') }}</h2>
            <ul class="divide-y divide-gray-200">
                <li v-for="order in monthlyOrders" :key="order._id" class="py-2">
                    <span class="font-medium">{{ formatDate(order.createdAt) }}</span> - <span class="text-green-600">€{{ order.total }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const { user } = useUserSession();
const balance = ref(null);
const recentOrders = ref([]);
const orderHistory = ref([]);
const monthlyOrders = ref([]);

const loadProfileData = async () => {
    const userId = user.value._id;
    balance.value = (await $fetch(`/api/users/balance?userId=${userId}`)).balance;
    recentOrders.value = await $fetch(`/api/users/orders/recent?userId=${userId}&limit=10`);
    orderHistory.value = await $fetch(`/api/users/orders/history?userId=${userId}`);
};

const loadOrders = async (month, year) => {
    monthlyOrders.value = await $fetch(`/api/users/orders/month?userId=${user.value._id}&month=${month}&year=${year}`);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

onMounted(loadProfileData);
</script>
