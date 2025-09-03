<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
  >
    <div class="container mx-auto">
      <!-- <CHeader /> -->
      <CContainer>
        <div class="flex w-fit items-center">
          <ToggleLang />
          <NuxtLink
            v-if="session?.isAdmin"
            :to="$localePath('/admin')"
            class="text-blue-500 ms-2"
          >
            {{ t("admin.title") }}
          </NuxtLink>
          <NuxtLink
            v-if="user"
            :to="$localePath('/user/profile')"
            class="text-blue-500 ms-2"
          >
            {{ t("profile.title") }}
          </NuxtLink>
          <NuxtLink
            v-if="user"
            :to="$localePath('/logout')"
            class="text-red-500 ms-2"
          >
            {{ t("logout") }}
          </NuxtLink>
        </div>
        <slot />
      </CContainer>
    </div>
  </div>
</template>

<script setup>
const { user, session } = useUserSession();
const { t } = useI18n();
</script>
