export interface TtsPayload {
  text: string;
  voice_id?: string;
  model_id?: string;
  output_format?: string;
}

export type TtsResponse = ArrayBuffer;

// === ASR ===
export interface AsrPayload {
  file: File | Blob;
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

export interface FoldersGetPayload {
  user_id: string;
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

export interface FolderCreatePayload {
  user_id: string;
  title: string;
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

export interface Folder {
  id: string;
  title: string;
  created_at: string;
}

export const useGptApi = () => {
  const folders = useState<Folder[] | null>("folders", () => null);
  const chats = useState<Chat[] | null>("chats", () => null);
  const selectedChats = useState<Chat[] | null>("selected-chats", () => null);
  const selectedChat = useState<Chat | null>("chat", () => null);
  const sendMessage = (payload: RequestPayload) => {
    return $fetch<GptResponse>("/api/interpret", {
      method: "POST",
      body: payload,
    });
  };

  async function createChat(payload: ChatCreatePayload) {
    const response = await $fetch<Chat>("/api/chats", {
      method: "POST",
      body: payload,
    });

    selectedChat.value = response;

    getChats({ user_id: payload.user_id });

    return response;
  }

  async function createFolder(payload: FolderCreatePayload) {
    const response = await $fetch<Folder>("/api/folders", {
      method: "POST",
      body: payload,
    });

    folders.value?.push(response);

    return response;
  }

  async function getChats(payload: ChatsGetPayload) {
    const response = await $fetch<Chat[]>("/api/chats", {
      method: "GET",
      query: payload,
    });

    if (payload.folder_id) {
      selectedChats.value = response;
    } else {
      chats.value = response;
    }

    return response;
  }

  async function getFolders(payload: FoldersGetPayload) {
    const response = await $fetch<Folder[]>("/api/folders", {
      method: "GET",
      query: payload,
    });

    folders.value = response;

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
    try {
      const response = await $fetch<ReadableStream>("/api/tts", {
        method: "POST",
        body: payload,
        responseType: "stream",
      });

      const reader = response.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
        }
      }

      // Собираем чанки в один Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      // Возвращаем как ArrayBuffer (TtsResponse предположительно ArrayBuffer)
      return combined.buffer;
    } catch (error) {
      console.error("Ошибка TTS стрима:", error);
      throw error; // Или верните fallback, если нужно
    }
  }

  async function asr(payload: AsrPayload): Promise<AsrResponse> {
    const form = new FormData();
    form.append("audio", payload.file, "audio.webm");

    return await $fetch<AsrResponse>("/api/asr", {
      method: "POST",
      body: form,
      query: {
        language: payload.language,
        prompt: payload.prompt,
      },
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
    folders,
    selectedChat,
    selectedChats,
    sendMessage,
    createChat,
    getChats,
    getChat,
    renameChat,

    getFolders,
    createFolder,

    tts,
    asr,
    sendVoiceMessage,
  };
};
