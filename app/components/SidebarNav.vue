<script setup lang="ts">
import ArrowIcon from "~/components/icons/ArrowIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import SettingsIcon from "~/components/icons/SettingsIcon.vue";

const isFoldersCollapse = ref<boolean>(false);
const isChatsCollapse = ref<boolean>(false);

function toggleFoldersCollapse() {
  isFoldersCollapse.value = !isFoldersCollapse.value;
}

function toggleChatsCollapse() {
  isChatsCollapse.value = !isChatsCollapse.value;
}
</script>

<template>
  <div class="max-w-[450px] size-full flex flex-col gap-6 p-8">
    <UCard
      :ui="{
        body: 'p-4 sm:p-4',
      }"
    >
      <div class="flex justify-between items-center">
        <UUser
          size="xl"
          name="Test"
          :avatar="{
            src: 'https://i.pravatar.cc/150?u=john-doe',
            icon: 'i-lucide-image',
          }"
        />

        <UModal title="Настройки">
          <UButton
            :icon="SettingsIcon"
            color="neutral"
            class="cursor-pointer"
          />

          <template #body>
            <UColorModeSwitch />
          </template>
        </UModal>
      </div>
    </UCard>

    <UCard
      class="h-full"
      :ui="{
        body: 'h-full flex flex-col',
      }"
    >
      <UInput
        icon="i-lucide-search"
        size="xl"
        placeholder="Поиск"
        class="w-full mb-4"
      />

      <div class="w-full px-1 mb-4">
        <div class="flex items-center justify-between w-full mb-3">
          <p class="text-xl">Папки</p>

          <div class="flex gap-2">
            <UButton
              :icon="PlusIcon"
              color="neutral"
              size="xs"
              class="cursor-pointer"
            />
            <UButton
              :icon="ArrowIcon"
              color="neutral"
              size="xs"
              class="transition-transform cursor-pointer"
              :class="{ 'rotate-180': isFoldersCollapse }"
              @click="toggleFoldersCollapse"
            />
          </div>
        </div>

        <Transition name="collapse" mode="out-in">
          <div
            v-show="!isFoldersCollapse"
            class="max-h-[246px] overflow-y-auto rounded-md"
            style="scrollbar-gutter: stable"
          >
            <div class="flex flex-col gap-2.5 p-1">
              <FolderCard v-for="card in 4" :key="card" />
            </div>
          </div>
        </Transition>
      </div>

      <div class="w-full px-2 mb-auto">
        <div class="flex items-center justify-between w-full mb-3">
          <p class="text-xl">Чаты</p>

          <UButton
            :icon="ArrowIcon"
            color="neutral"
            size="xs"
            class="transition-transform cursor-pointer"
            :class="{ 'rotate-180': isChatsCollapse }"
            @click="toggleChatsCollapse"
          />
        </div>

        <Transition name="collapse" mode="out-in">
          <div
            v-show="!isChatsCollapse"
            class="max-h-[246px] overflow-y-auto rounded-md"
            style="scrollbar-gutter: stable"
          >
            <div class="flex flex-col gap-2.5 p-1">
              <ChatCard v-for="card in 8" :key="card" />
            </div>
          </div>
        </Transition>
      </div>

      <UButton
        size="xl"
        :trailing-icon="PlusIcon"
        class="justify-between cursor-pointer"
      >
        Новый чат
      </UButton>
    </UCard>
  </div>
</template>

<style>
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 246px;
  opacity: 1;
}
</style>
