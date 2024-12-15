<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
  >
    <div>
      <div class="container mx-auto">
        
        <!-- <CHeader /> -->
        <CContainer>
           <ToggleLang />
           <slot />
         </CContainer>
      </div>
    </div>
  </div>
</template>
