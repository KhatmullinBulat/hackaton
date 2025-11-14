<script setup lang="ts">
import ChatIcon from "./icons/ChatIcon.vue";
import MoreIcon from "./icons/MoreIcon.vue";
</script>

<template>
  <UCard
    :ui="{
      root: 'w-full max-w-lg rounded-xl',
      body: 'p-3 sm:p-3',
    }"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <ChatIcon />

        <p class="text-xl truncate">Чат</p>
      </div>

      <MoreIcon />
    </div>
  </UCard>
</template>
