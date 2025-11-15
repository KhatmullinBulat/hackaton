<script setup lang="ts">
import FolderIcon from "./icons/FolderIcon.vue";
import MoreIcon from "./icons/MoreIcon.vue";

const props = defineProps<{
  title: string;
  id: string;
  isModalOpen: boolean;
}>();

const { userId } = useAuthApi();
const { selectedChats, selectedChat, getChats, createChat } = useGptApi();

const open = ref(false);
const inputModel = ref("");

function selectChat(selectedId: string) {
  const chat = selectedChats.value?.find((chat) => chat.id === selectedId);

  if (!chat) return;

  selectedChat.value = chat;
}

async function handleCreateChat() {
  if (!userId.value) {
    return;
  }

  const payload: ChatCreatePayload = {
    user_id: userId.value,
    title: "Новый сон",
    folder_id: props.id,
  };

  await createChat(payload);
}

async function update() {
  if (userId.value) {
    try {
      await getChats({ user_id: userId.value, folder_id: props.id });
    } catch (err) {
      console.error("Ошибка загрузки чатов:", err);
    }
  }
}

watch(
  () => props.isModalOpen,
  async (newIsModalOpen) => {
    if (newIsModalOpen && userId.value) {
      try {
        await getChats({ user_id: userId.value, folder_id: props.id });
      } catch (err) {
        console.error("Ошибка загрузки чатов:", err);
      }
    }
  },
  { immediate: false }
);
</script>

<template>
  <UCard
    class="transition-colors hover:bg-blue-100 dark:hover:bg-white/10"
    :ui="{
      root: 'w-full max-w-lg rounded-xl',
      body: 'p-0 px-3 sm:p-0 sm:px-3',
    }"
  >
    <div class="flex justify-between items-center">
      <UModal title="Чаты" @update:open="update">
        <div class="flex items-center gap-2 w-full py-3">
          <FolderIcon />
          <p class="text-xl truncate">{{ title }}</p>
        </div>

        <template #body>
          <p v-if="!selectedChats?.length">Чаты отсутствуют</p>
          <div
            v-else
            class="max-h-[260px] overflow-y-auto rounded-md"
            style="scrollbar-gutter: stable"
          >
            <div class="flex flex-col gap-2.5 p-1">
              <ChatCard
                v-for="card in selectedChats"
                :key="card.id"
                :title="card.title"
                @click="selectChat(card.id)"
              />
            </div>
          </div>
        </template>
      </UModal>

      <UModal v-model:open="open" title="Создать новый чат">
        <button
          class="py-1 cursor-pointer hover:rotate-90 transition-transform"
        >
          <MoreIcon />
        </button>

        <template #body>
          <div class="flex flex-col gap-3">
            <UInput
              v-model="inputModel"
              size="xl"
              placeholder="Введите название чата"
            />

            <UButton
              :disabled="inputModel.length === 0"
              class="w-max"
              color="primary"
              @click="handleCreateChat"
            >
              Изменить
            </UButton>
          </div>
        </template>
      </UModal>
    </div>
  </UCard>
</template>
