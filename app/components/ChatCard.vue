<script setup lang="ts">
import ChatIcon from "./icons/ChatIcon.vue";
import MoreIcon from "./icons/MoreIcon.vue";

defineProps<{
  title: string;
}>();

const toast = useToast();
const open = ref(false);

const { userId } = useAuthApi();
const { renameChat, selectedChat } = useGptApi();

const inputModel = ref(selectedChat.value?.title);

async function handleRename() {
  try {
    if (!selectedChat.value?.id || !inputModel.value || !userId.value) return;

    const response = await renameChat(
      selectedChat.value?.id,
      inputModel.value,
      userId.value
    );

    if (response) {
      toast.add({
        color: "success",
        title: "Данные успешно изменены!",
      });
      open.value = false;
    } else {
      // Handle unexpected response structure if needed
      throw new Error("В ответе на вход отсутствуют обязательные поля");
    }
  } catch (e: unknown) {
    console.error(e);
  }
}
</script>

<template>
  <UCard
    :ui="{
      root: 'w-full max-w-lg rounded-xl',
      body: 'p-3 sm:p-3',
    }"
    class="transition-colors hover:bg-blue-100 dark:hover:bg-white/10"
  >
    <div class="flex justify-between items-center gap-3">
      <div class="flex items-center gap-2">
        <ChatIcon />

        <p class="text-xl truncate">{{ title }}</p>
      </div>

      <UModal v-model:open="open" title="Редактирование">
        <button
          class="py-1 cursor-pointer hover:rotate-90 transition-transform"
        >
          <MoreIcon />
        </button>

        <template #body>
          <div class="flex flex-col gap-3">
            {{ selectedChat?.title }}

            <UInput v-model="inputModel" />

            <UButton class="w-max" color="primary" @click="handleRename">
              Изменить
            </UButton>
          </div>
        </template>
      </UModal>
    </div>
  </UCard>
</template>
