<template>
  <div class="flex h-max items-center justify-center">
    <div
      class="max-w-sm w-full space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h2
        class="text-xl font-extrabold text-center text-gray-900 dark:text-white"
      >
        {{ $t("login.title") }}
      </h2>

      <div v-if="resetSuccess" class="text-center text-green-500">
        {{ $t("login.resetSuccess") }}
      </div>

      <div
        v-if="errors.general"
        class="p-2 bg-red-100 text-red-700 rounded text-sm text-center"
      >
        {{ errors.general }}
      </div>

      <form class="space-y-2" @submit.prevent="handleLogin">
        <div class="space-y-1">
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("login.username") }}</label
          >
          <input
            id="username"
            v-model="data.username"
            name="username"
            type="text"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            :class="{ 'border-red-500': errors.username }"
            :placeholder="$t('login.usernamePlaceholder')"
            @input="clearUsernameError"
          />
          <div v-if="errors.username" class="text-red-500 mt-1 text-sm">
            {{ errors.username }}
          </div>
        </div>

        <div class="space-y-1">
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("login.password") }}</label
          >
          <input
            id="password"
            v-model="data.password"
            name="password"
            type="password"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            :class="{ 'border-red-500': errors.password }"
            placeholder="••••••••••"
            @input="clearPasswordError"
          />
          <div v-if="errors.password" class="text-red-500 mt-1 text-sm">
            {{ errors.password }}
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="rememberMe"
            v-model="data.rememberMe"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            for="rememberMe"
            class="ml-2 block text-sm text-gray-900 dark:text-white"
          >
            {{ $t("login.rememberMe") }}
          </label>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Loading...</span>
            <span v-else>{{ $t("login.submit") }}</span>
          </button>
        </div>

        <div class="space-y-2">
          <div class="text-sm text-center">
            {{ $t("login.noAccount") }}
            <NuxtLink
              :to="$localePath('/register')"
              class="text-blue-600 hover:text-blue-800 ml-1"
            >
              {{ $t("login.register") }}
            </NuxtLink>
          </div>
          <div class="text-sm text-center">
            {{ $t("login.forgotPassword") }}
            <NuxtLink
              :to="$localePath('/user/forgot-password')"
              class="text-blue-600 hover:text-blue-800 ml-1"
            >
              {{ $t("login.resetHere") }}
            </NuxtLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useLoginForm } from "~/composables/useLoginForm";
import { useLoginErrorHandling } from "~/composables/useLoginErrorHandling";
import type { ILoginCredentials } from "~/types";

const router = useRouter();
const route = useRoute();
const { clear } = useUserSession();
const authStore = useAuthStore();

const {
  data,
  errors,
  isLoading,
  resetSuccess,
  clearErrors,
  clearUsernameError,
  clearPasswordError,
  setResetSuccess,
} = useLoginForm();

const { handleLoginError } = useLoginErrorHandling();

onMounted(async () => {
  await clear();
  if (route.query.resetSuccess === "true") {
    setResetSuccess(true);
  }
});

const handleLogin = async () => {
  clearErrors();
  isLoading.value = true;

  try {
    const credentials: ILoginCredentials = {
      username: data.value.username,
      password: data.value.password,
    };

    const success = await authStore.login(credentials);

    if (success) {
      router.push("/");
    }
  } catch (error: unknown) {
    const errorResult = handleLoginError(error);
    errors.value.username = errorResult.usernameError;
    errors.value.password = errorResult.passwordError;
    errors.value.general = errorResult.generalError;
  } finally {
    isLoading.value = false;
  }
};
</script>
