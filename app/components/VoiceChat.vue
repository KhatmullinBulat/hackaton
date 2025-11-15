<script setup lang="ts">
import BotIcon from "./icons/BotIcon.vue";

// --- Пропсы и модели ---
const isVoiceMode = defineModel<boolean>();

// --- Состояние компонента ---
const state = ref<"idle" | "listening" | "processing" | "speaking" | "error">(
  "idle"
);
const errorMessage = ref<string | null>(null);

// --- Логика записи ---
const micRecorder = ref<MediaRecorder | null>(null);
const recordingTimer = ref<ReturnType<typeof setTimeout> | null>(null); // Таймер для авто-остановки
let audioChunks: Blob[] = [];

// --- API из вашего composable (предполагаем, что они существуют) ---
const { userId } = useAuthApi();
const { asr, sendMessage, selectedChat, tts, createChat } = useGptApi();

// --- Константы для настройки ---
const RECORDING_TIMEOUT = 10000; // 5 секунд на запись
const MIN_TEXT_LENGTH = 3; // Минимальная длина распознанного текста для отправки

// --- Управление записью ---

const startListening = async () => {
  if (state.value === "listening") return;
  errorMessage.value = null;
  state.value = "listening";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micRecorder.value = new MediaRecorder(stream);
    audioChunks = [];

    micRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    micRecorder.value.onstop = async () => {
      // Очищаем таймер и стрим
      if (recordingTimer.value) clearTimeout(recordingTimer.value);
      micRecorder.value?.stream.getTracks().forEach((track) => track.stop());

      state.value = "idle";
      if (audioChunks.length === 0) return;

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      await processSpeech(audioBlob);
    };

    micRecorder.value.start();

    // Устанавливаем таймер на автоматическую остановку
    recordingTimer.value = setTimeout(() => {
      stopListening();
    }, RECORDING_TIMEOUT);
  } catch (err) {
    console.error("Ошибка доступа к микрофону:", err);
    errorMessage.value = "Не удалось получить доступ к микрофону.";
    state.value = "error";
  }
};

const stopListening = () => {
  // Проверяем, активна ли запись, чтобы не вызывать stop() дважды
  if (micRecorder.value && micRecorder.value.state === "recording") {
    micRecorder.value.stop();
  }
  if (recordingTimer.value) {
    clearTimeout(recordingTimer.value);
    recordingTimer.value = null;
  }
  state.value = "idle";
};

// --- Обработка речи ---

const processSpeech = async (audioBlob: Blob) => {
  if (!selectedChat.value?.id || !userId.value) {
    errorMessage.value = "Невозможно отправить сообщение: чат не выбран.";
    state.value = "error";
    return;
  }

  state.value = "processing";

  try {
    // 1. Speech → Text
    const asrResponse = await asr({ file: audioBlob });
    const userText = asrResponse.text.trim();
    console.log("Распознанный текст:", userText);

    if (!userId.value) return;

    if (!selectedChat.value) {
      const payload: ChatCreatePayload = {
        user_id: userId.value,
        title: userText.slice(0, 20),
      };

      await createChat(payload);
    }

    // Улучшенная проверка: не отправляем пустые или слишком короткие сообщения
    if (userText.length < MIN_TEXT_LENGTH) {
      console.log("Распознан слишком короткий текст, проигнорировано.");
      state.value = "idle";
      return;
    }

    // 2. LLM
    const aiResponse = await sendMessage({
      message: userText,
      user_id: userId.value,
      chat_id: selectedChat.value.id,
    });
    const replyText = aiResponse.reply;
    console.log("Ответ ассистента:", replyText);
    state.value = "idle"; // Обработка текста завершена

    // 3. Text → Speech
    const audioBuffer = await tts({ text: replyText });
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    state.value = "speaking";
    audio.onended = () => {
      state.value = "idle";
      URL.revokeObjectURL(url);
      // Не начинаем слушать автоматически. Ждем следующего нажатия от пользователя.
      // Если нужен режим "непрерывного диалога", можно раскомментировать строку ниже
      // if (isVoiceMode.value) startListening();
    };
    audio.play();
  } catch (error) {
    console.error("Ошибка в цикле обработки голоса:", error);
    errorMessage.value = "Произошла ошибка при обработке вашего запроса.";
    state.value = "error";
  }
};

// --- Жизненный цикл компонента ---

onUnmounted(() => {
  stopListening();
});

// Следим за изменением режима. Если пользователь выключает голосовой режим, останавливаем запись.
watch(isVoiceMode, (newValue) => {
  if (!newValue) {
    stopListening();
  }
});
</script>

<template>
  <div class="w-full my-auto">
    <!-- Основной контейнер, адаптированный под темную тему -->
    <div
      class="flex flex-col items-center justify-center gap-6 p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto bg-slate-100 dark:bg-slate-800"
    >
      <!-- Контейнер для анимаций -->
      <div
        class="relative flex items-center justify-center h-48 w-48 rounded-full bg-white dark:bg-slate-700 shadow-inner"
      >
        <!-- Анимация: Режим прослушивания (listening) -->
        <div v-if="state === 'listening'" class="listening-animation">
          <div class="circle pulse-circle-1"></div>
          <div class="circle pulse-circle-2"></div>
          <div
            class="main-circle flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-500"
          >
            <BotIcon class="h-10 w-10" />
          </div>
        </div>

        <!-- Анимация: Режим обработки (processing) -->
        <div
          v-else-if="state === 'processing'"
          class="processing-animation"
        ></div>

        <!-- Анимация: Ассистент говорит (speaking) -->
        <div v-else-if="state === 'speaking'" class="speaking-animation">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
          <div class="wave wave-3"></div>
        </div>

        <!-- Состояние по умолчанию (idle) или ошибка -->
        <div v-else class="text-gray-400 dark:text-gray-500">
          <BotIcon class="h-12 w-12" />
        </div>
      </div>

      <!-- Текст статуса -->
      <div
        class="text-center font-medium transition-colors duration-300"
        :class="{
          'text-red-500 dark:text-red-400 font-semibold': state === 'error',
          'text-gray-600 dark:text-gray-300': state !== 'error',
        }"
      >
        <span v-if="state === 'listening'">Прослушивание...</span>
        <span v-else-if="state === 'processing'">Обработка...</span>
        <span v-else-if="state === 'speaking'">Говорит ассистент...</span>
        <span v-else-if="state === 'error'">{{ errorMessage }}</span>
        <span v-else>Нажмите, чтобы говорить</span>
      </div>

      <!-- Единая кнопка управления -->
      <button
        class="flex items-center justify-center w-24 h-24 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-70 hover:scale-105 active:scale-95"
        :class="{
          'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400':
            state === 'idle',
          'bg-red-500 hover:bg-red-600 focus:ring-red-400':
            state === 'listening',
          'bg-gray-400 dark:bg-gray-600':
            state === 'processing' || state === 'speaking',
          'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400':
            state === 'error',
        }"
        :disabled="state === 'processing' || state === 'speaking'"
        @click="state === 'listening' ? stopListening() : startListening()"
      >
        <!-- Иконка "Стоп" -->
        <svg
          v-if="state === 'listening'"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M6 6h12v12H6z"></path>
        </svg>
        <!-- Иконка "Микрофон" (по умолчанию) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<style>
/* CSS-анимации, которые сложно воспроизвести с помощью Tailwind */

/* --- Анимация 1: LISTENING --- */
.listening-animation {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.listening-animation .circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #10b981; /* emerald-500 */
}
.listening-animation .pulse-circle-1,
.listening-animation .pulse-circle-2 {
  animation: pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
}
.listening-animation .pulse-circle-2 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    width: 96px; /* 6rem */
    height: 96px; /* 6rem */
    opacity: 1;
  }
  100% {
    width: 160px; /* 10rem */
    height: 160px; /* 10rem */
    opacity: 0;
  }
}

/* --- Анимация 2: PROCESSING --- */
.processing-animation {
  width: 96px; /* 6rem */
  height: 96px; /* 6rem */
  border: 6px solid #e5e7eb; /* gray-200 */
  border-top-color: #3b82f6; /* blue-500 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
/* Адаптация для темной темы */
@media (prefers-color-scheme: dark) {
  .processing-animation {
    border-color: #4b5563; /* gray-600 */
    border-top-color: #60a5fa; /* blue-400 */
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- Анимация 3: SPEAKING --- */
.speaking-animation {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 96px; /* 6rem */
  height: 96px; /* 6rem */
}
.speaking-animation .wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #3b82f6; /* blue-500 */
  opacity: 0.6;
  animation: wave 1.5s infinite ease-out;
}
.speaking-animation .wave-2 {
  animation-delay: 0.3s;
}
.speaking-animation .wave-3 {
  animation-delay: 0.6s;
}

@keyframes wave {
  0% {
    transform: scale(0.1);
    opacity: 0.8;
  }
  70% {
    opacity: 0.1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
</style>
