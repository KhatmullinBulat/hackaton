<script setup lang="ts">
import BotIcon from "./icons/BotIcon.vue";
import UploadIcon from "./icons/UploadIcon.vue";

type ChatRole = "user" | "assistant" | "system";

type ChatPart = {
  type: "text";
  text: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  parts: ChatPart[];
};

// const mode = ref<"text" | "voice">("text");
// const isRecording = ref(false);
// const mediaRecorder = ref<MediaRecorder | null>(null);
// const audioChunks: Blob[] = [];

const { userId } = useAuthApi();
const { sendMessage, selectedChat, getChat } = useGptApi();

const inputText = ref("");
const pending = ref(false);
const error = ref<unknown | null>(null);
const messages = ref<ChatMessage[]>([]);

const messageStatus = computed(() => {
  if (pending.value && messages.value.length > 0) return "submitted";
  else if (error.value !== null || error.value !== undefined) return "error";

  return "ready";
});

const handleSubmit = async () => {
  if (!userId.value || !selectedChat.value) return;

  messages.value.push({
    id: crypto.randomUUID(),
    role: "user",
    parts: [
      {
        type: "text",
        text: inputText.value,
      },
    ],
  });
  pending.value = true;
  error.value = null;

  try {
    const {
      data,
      error: fetchError,
      execute,
    } = sendMessage({
      user_id: userId.value,
      chat_id: selectedChat.value?.id,
      message: inputText.value,
    });

    await execute();

    inputText.value = "";

    if (fetchError.value) {
      throw fetchError.value;
    }

    messages.value.push({
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        {
          type: "text",
          text: data.value?.reply || "",
        },
      ],
    });
  } catch (e: unknown) {
    error.value = e;
    inputText.value = "";
  } finally {
    pending.value = false;
  }
};

watch(selectedChat, async (newSelectedChat, oldSelectedChat) => {
  if (newSelectedChat && newSelectedChat !== oldSelectedChat) {
    console.log(
      "Selected chat changed, loading messages for:",
      newSelectedChat.id
    );

    pending.value = true;
    try {
      messages.value = [];
      if (!selectedChat.value?.id || !userId.value) return;

      const messagesData = await getChat({
        chat_id: selectedChat.value?.id,
        user_id: userId.value,
      });

      messages.value = messagesData.map((msg) => ({
        id: msg.id,
        role: msg.role as ChatRole,
        parts: [
          {
            type: "text",
            text: msg.content,
          },
        ],
      }));
    } catch (err) {
      console.error(
        "Error loading messages for chat:",
        newSelectedChat.id,
        err
      );
      error.value = err;
    } finally {
      pending.value = false;
    }
  }
});
</script>

<template>
  <div class="size-full p-8 flex flex-col gap-12">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div class="flex items-end gap-4">
        <h2 class="text-2xl truncate max-w-[300px]">
          {{ selectedChat?.title || "Новый сон" }}
        </h2>

        <img v-show="!pending" src="/sonic-idle.gif" width="60px" />
        <img v-show="pending" src="/sonic-running.gif" width="61.5px" />
      </div>

      <button class="cursor-pointer">
        <UploadIcon />
      </button>
    </div>

    <Transition name="fade" mode="out-in" appear>
      <div
        v-if="messages.length === 0 && pending === false"
        class="size-full flex flex-col justify-center items-center gap-6"
      >
        <h3 class="text-4xl">Привет!</h3>
        <p class="text-2xl">Расскажите, какой сон вы видели сегодня?</p>
      </div>
    </Transition>

    <UChatMessages
      lang="ru"
      :status="messageStatus"
      :assistant="{
        side: 'left',
        variant: 'outline',
        avatar: {
          icon: BotIcon,
        },
        actions: [
          {
            label: 'Copy to clipboard',
            icon: 'lucide:copy',
          },
        ],
      }"
      :messages="messages"
      class="overflow-y-auto"
    />

    <div class="mt-auto flex flex-col items-center">
      <UChatPrompt
        v-model="inputText"
        placeholder="Введите свое сообщение здесь..."
        @submit="handleSubmit"
      >
        <div class="flex gap-2">
          <UChatPromptSubmit />
          <UButton :disabled="pending" icon="lucide:mic" color="secondary" />
        </div>
      </UChatPrompt>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
