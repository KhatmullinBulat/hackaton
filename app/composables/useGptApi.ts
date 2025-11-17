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

  const sendMessage = async (payload: RequestPayload) => {
    try {
      return await $fetch<GptResponse>("/api/interpret", {
        method: "POST",
        body: payload,
      });
    } catch (error) {
      console.error("sendMessage error:", error);
      throw error;
    }
  };

  async function createChat(payload: ChatCreatePayload) {
    try {
      const response = await $fetch<Chat>("/api/chats", {
        method: "POST",
        body: payload,
      });

      selectedChat.value = response;

      await getChats({ user_id: payload.user_id });

      return response;
    } catch (error) {
      console.error("createChat error:", error);
      throw error;
    }
  }

  async function createFolder(payload: FolderCreatePayload) {
    try {
      const response = await $fetch<Folder>("/api/folders", {
        method: "POST",
        body: payload,
      });

      folders.value?.push(response);

      return response;
    } catch (error) {
      console.error("createFolder error:", error);
      throw error;
    }
  }

  async function getChats(payload: ChatsGetPayload) {
    try {
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
    } catch (error) {
      console.error("getChats error:", error);
      throw error;
    }
  }

  async function getFolders(payload: FoldersGetPayload) {
    try {
      const response = await $fetch<Folder[]>("/api/folders", {
        method: "GET",
        query: payload,
      });

      folders.value = response;

      return response;
    } catch (error) {
      console.error("getFolders error:", error);
      throw error;
    }
  }

  async function getChat(payload: ChatGetPayload) {
    if (!payload) throw new Error("chatId обязателен для получения сообщений");

    try {
      const url = `/api/chats/${payload.chat_id}/messages`;

      return await $fetch<ChatMessage[]>(url, {
        method: "GET",
        query: payload,
      });
    } catch (error) {
      console.error("getChat error:", error);
      throw error;
    }
  }

  async function renameChat(chatId: string, title: string, userId: string) {
    if (!chatId) throw new Error("chatId обязателен");

    try {
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
    } catch (error) {
      console.error("renameChat error:", error);
      throw error;
    }
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
        if (value) chunks.push(value);
      }

      const total = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(total);

      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      return combined.buffer;
    } catch (error) {
      console.error("TTS error:", error);
      throw error;
    }
  }

  async function asr(payload: AsrPayload): Promise<AsrResponse> {
    try {
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
    } catch (error) {
      console.error("ASR error:", error);
      throw error;
    }
  }

  async function sendVoiceMessage(
    audio: File,
    user_id: string,
    chat_id: string
  ) {
    try {
      const { text } = await asr({ file: audio });

      const reply = await $fetch<GptResponse>("/api/interpret", {
        method: "POST",
        body: { user_id, chat_id, message: text },
      });

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
    } catch (error) {
      console.error("sendVoiceMessage error:", error);
      throw error;
    }
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
