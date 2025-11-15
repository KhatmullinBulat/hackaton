export interface TtsPayload {
  text: string;
  voice_id: string;
  model_id?: string;
  output_format?: string;
}

export type TtsResponse = ArrayBuffer;

// === ASR ===
export interface AsrPayload {
  file: File;
  language?: string;
  prompt?: string;
}

export interface AsrResponse {
  text: string;
}

interface RequestPayload {
  user_id: string;
  chat_id: string;
  message: string;
}

export interface ChatsGetPayload {
  user_id: string;
  folder_id?: string;
}

export interface ChatGetPayload {
  chat_id: string;
  user_id: string;
  limit?: number;
}

export interface ChatCreatePayload {
  user_id: string;
  title: string;
  folder_id?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface GptResponse {
  chat_id: string;
  reply: string;
}

export interface Chat {
  id: string;
  title: string;
  folder_id: string;
  created_at: string;
  updated_at: string;
}

export const useGptApi = () => {
  const chats = useState<Chat[] | null>("chats", () => null);
  const selectedChat = useState<Chat | null>("chat", () => null);
  const sendMessage = (payload: RequestPayload) => {
    return useFetch<GptResponse>("/api/interpret", {
      method: "POST",
      body: payload,
      immediate: false,
    });
  };

  async function createChat(payload: ChatCreatePayload) {
    const response = await $fetch<Chat>("/api/chats", {
      method: "POST",
      body: payload,
    });

    selectedChat.value = response;
    chats.value?.push(response);

    return response;
  }

  async function getChats(payload: ChatsGetPayload) {
    const response = await $fetch<Chat[]>("/api/chats", {
      method: "GET",
      query: payload,
    });

    chats.value = response;

    return response;
  }

  async function getChat(payload: ChatGetPayload) {
    if (!payload) {
      throw new Error("chatId обязателен для получения сообщений");
    }

    const url = `/api/chats/${payload.chat_id}/messages`;

    const response = await $fetch<ChatMessage[]>(url, {
      method: "GET",
      query: payload,
    });

    return response;
  }

  async function renameChat(chatId: string, title: string, userId: string) {
    if (!chatId) {
      throw new Error("chatId обязателен для получения сообщений");
    }

    const url = `/api/chats/${chatId}`;

    const response = await $fetch<Chat>(url, {
      method: "PATCH",
      body: { user_id: userId, title },
    });

    if (selectedChat.value) {
      selectedChat.value = { ...response };
    }

    if (chats.value) {
      const index = chats.value.findIndex((chat) => chat.id === chatId);

      if (index !== -1) {
        chats.value = chats.value.map((chat, i) =>
          i === index ? response : chat
        );
      } else {
        console.warn(`Chat with id ${response.id} not found in state.`);
      }
    }

    return response;
  }

  async function tts(payload: TtsPayload): Promise<TtsResponse> {
    const arrayBuffer = await $fetch<ArrayBuffer>("/api/tts", {
      method: "POST",
      body: payload,
      responseType: "arrayBuffer",
    });

    return arrayBuffer;
  }

  async function asr(payload: AsrPayload): Promise<AsrResponse> {
    const form = new FormData();
    form.append("file", payload.file);

    if (payload.language) form.append("language", payload.language);
    if (payload.prompt) form.append("prompt", payload.prompt);

    return await $fetch<AsrResponse>("/api/asr", {
      method: "POST",
      body: form,
    });
  }

  async function sendVoiceMessage(
    audio: File,
    user_id: string,
    chat_id: string
  ) {
    // 1) ASR: аудио → текст
    const { text } = await asr({ file: audio });

    // 2) GPT: текст → ответ
    const reply = await $fetch<GptResponse>("/api/interpret", {
      method: "POST",
      body: {
        user_id,
        chat_id,
        message: text,
      },
    });

    // 3) TTS: ответ → аудио
    const audioBuffer = await tts({
      text: reply.reply,
      voice_id: "default",
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    return {
      user_text: text,
      assistant_text: reply.reply,
      audio: audioBuffer,
    };
  }

  return {
    chats,
    selectedChat,
    sendMessage,
    createChat,
    getChats,
    getChat,
    renameChat,

    tts,
    asr,
    sendVoiceMessage,
  };
};
