<script setup lang="ts">
import ArrowIcon from "~/components/icons/ArrowIcon.vue";
import PlusIcon from "~/components/icons/PlusIcon.vue";
import SettingsIcon from "~/components/icons/SettingsIcon.vue";
import type {
  ChatCreatePayload,
  FolderCreatePayload,
  FoldersGetPayload,
} from "~/composables/useGptApi";

const isVoiceMode = defineModel<boolean>();
const emit = defineEmits(["close"]);

const { userId } = useAuthApi();
const {
  getChats,
  chats,
  createChat,
  selectedChat,
  createFolder,
  getFolders,
  folders,
} = useGptApi();

const pending = ref(false);
const error = ref<string | null>(null);
const toast = useToast();

const isFoldersCollapse = ref<boolean>(false);
const isChatsCollapse = ref<boolean>(false);

const isFolderModalOpen = ref(false);
const folderCreateInputModel = ref("");
const chatCreateInputModel = ref("");

function toggleFoldersCollapse() {
  isFoldersCollapse.value = !isFoldersCollapse.value;
}

function toggleChatsCollapse() {
  isChatsCollapse.value = !isChatsCollapse.value;
}

function selectChat(id: string) {
  const chat = chats.value?.find((chat) => chat.id === id);

  if (!chat) return;
  selectedChat.value = chat;

  isVoiceMode.value = false;
}

async function handleCreateFolder() {
  if (!userId.value) {
    error.value = "Отсутствует ID пользователя.";
    return;
  }

  try {
    const payload: FolderCreatePayload = {
      user_id: userId.value,
      title: folderCreateInputModel.value,
    };

    const folder = await createFolder(payload);

    const chatPayload: ChatCreatePayload = {
      user_id: userId.value,
      title: chatCreateInputModel.value,
      folder_id: folder.id,
    };

    const chat = await createChat(chatPayload);

    isVoiceMode.value = false;

    isFolderModalOpen.value = false;
    console.log("Список папок получен:", folder, chat);
  } catch (e: unknown) {
    console.error("Registration error:", e);

    let message = "Что-то пошло не так.";

    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }

    toast.add({
      color: "error",
      title: "Ошибка входа",
      description: message,
    });
    error.value = message;
  } finally {
    pending.value = false;
  }
}

async function handleCreateChat() {
  if (!userId.value) {
    error.value = "Отсутствует ID пользователя.";
    return;
  }
  try {
    const payload: ChatCreatePayload = {
      user_id: userId.value,
      title: "Новый сон",
    };

    const chat = await createChat(payload);

    isVoiceMode.value = false;

    console.log("Список чатов получен:", chat);
  } catch (e: unknown) {
    console.error("Ошибка при получении чатов:", e);
    error.value = e as string;
    toast.add({
      color: "error",
      title: "Ошибка",
      description: error.value,
    });
  } finally {
    pending.value = false;
  }
}

async function handleGetFolders() {
  if (!userId.value) {
    error.value = "Отсутствует ID пользователя.";
    return;
  }
  try {
    const payload: FoldersGetPayload = {
      user_id: userId.value,
    };

    const folderList = await getFolders(payload);

    console.log("Список чатов получен:", folderList);
  } catch (e: unknown) {
    console.error("Ошибка при получении папок:", e);
    error.value = e as string;
    toast.add({
      color: "error",
      title: "Ошибка",
      description: error.value,
    });
  } finally {
    pending.value = false;
  }
}

async function handleGetChats() {
  if (!userId.value) {
    error.value = "Отсутствует ID пользователя.";
    return;
  }
  try {
    // 1. Подготовить payload
    const payload: ChatsGetPayload = {
      user_id: userId.value,
    };

    // 2. Вызвать getChats и дождаться результата
    const chatsList = await getChats(payload);

    console.log("Список чатов получен:", chatsList);
    // UI обновляется автоматически через reactive state в composable
    // chats.value в useGptApi теперь содержит список
  } catch (e: unknown) {
    console.error("Ошибка при получении чатов:", e);
    error.value = e as string;
    toast.add({
      color: "error",
      title: "Ошибка",
      description: error.value,
    });
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  handleGetChats();
  handleGetFolders();
});
</script>

<template>
  <div class="lg:max-w-[450px] h-full flex flex-col gap-6 py-6 px-3">
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

        <div class="flex items-center gap-2">
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

          <UButton
            color="neutral"
            class="lg:hidden h-full"
            icon="lucide:circle-x"
            @click="emit('close')"
          />
        </div>
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
            <UModal v-model:open="isFolderModalOpen" title="Создание папки">
              <UButton
                :icon="PlusIcon"
                color="neutral"
                size="xs"
                class="cursor-pointer"
              />

              <template #body>
                <div class="flex flex-col gap-4">
                  <UInput
                    v-model="folderCreateInputModel"
                    size="xl"
                    placeholder="Введите название папки"
                  />

                  <UInput
                    v-model="chatCreateInputModel"
                    size="xl"
                    placeholder="Введите название чата"
                  />

                  <UButton
                    :disabled="
                      folderCreateInputModel.length === 0 ||
                      chatCreateInputModel.length === 0
                    "
                    class="w-max"
                    @click="handleCreateFolder"
                  >
                    Создать
                  </UButton>
                </div>
              </template>
            </UModal>

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
              <FolderCard
                v-for="card in folders"
                :id="card.id"
                :key="card.id"
                :title="card.title"
                :is-modal-open="isFolderModalOpen"
              />
            </div>
          </div>
        </Transition>
      </div>

      <div class="w-full px-2 flex-1 min-h-0 flex flex-col mb-12">
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
          <!-- 
            ИЗМЕНЕНИЕ 2: Сам список чатов.
            - Убираем 'max-h-[260px]'.
            - Добавляем 'h-full', чтобы он заполнил всю высоту своего нового "растягиваемого" родителя.
          -->
          <div
            v-show="!isChatsCollapse"
            class="h-full overflow-y-auto rounded-md"
            style="scrollbar-gutter: stable"
          >
            <div class="flex flex-col gap-2.5 p-1">
              <ChatCard
                v-for="card in chats"
                :key="card.id"
                :title="card.title"
                @click="selectChat(card.id)"
              />
            </div>
          </div>
        </Transition>
      </div>

      <UButton
        size="xl"
        :trailing-icon="PlusIcon"
        class="justify-between cursor-pointer"
        @click="handleCreateChat"
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
