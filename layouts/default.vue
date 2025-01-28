<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
  >
      <div class="container mx-auto ">
        <!-- <CHeader /> -->
        <CContainer>
          <div class="flex w-fit items-center">
            <ToggleLang />
            <NuxtLink to="/admin" class="text-blue-500 ms-2">
              To admin
            </NuxtLink>
            <NuxtLink to="/logout" class="text-red-500 ms-2">
              Logout
            </NuxtLink>
          </div>
          <slot />
        </CContainer>
      </div>
    </div>
</template>
