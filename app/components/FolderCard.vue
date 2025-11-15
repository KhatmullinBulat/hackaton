<script setup lang="ts">
import FolderIcon from "./icons/FolderIcon.vue";
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
        <FolderIcon />

        <p class="text-xl truncate">Папка</p>
      </div>

      <MoreIcon class="cursor-pointer" />
    </div>
  </UCard>
</template>
