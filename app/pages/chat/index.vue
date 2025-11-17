<script setup lang="ts">
import VoiceChat from "~/components/VoiceChat.vue";

const isVoiceMode = ref(false);
const sidebarOpen = ref(false);

const { width } = useScreen();
// const { userId } = useAuthApi();

watch(
  width,
  (value) => {
    sidebarOpen.value = value > 1024;
  },
  { immediate: true }
);

definePageMeta({
  middleware: ["auth-guard"],
});

// definePageMeta({
//   middleware: [
//     function () {
//       const isAuth = userId.value?.length;

//       if (!isAuth) {
//         return navigateTo("/login");
//       }
//     },
//   ],
// });
</script>

<template>
  <div class="size-full animated-bg">
    <div
      class="blob"
      style="background: #60a5fa; top: 10%; left: 15%; animation-delay: 0s"
    />
    <div
      class="blob"
      style="background: #34d399; top: 50%; left: 60%; animation-delay: 5s"
    />
    <div
      class="blob"
      style="background: #f472b6; top: 20%; left: 70%; animation-delay: 10s"
    />

    <div class="size-full flex gap-8 z-10">
      <SidebarNav
        v-show="sidebarOpen"
        v-model="isVoiceMode"
        class="lg:flex lg:static top-0 left-0 z-50 w-full"
        @close="sidebarOpen = false"
      />

      <UButton
        color="neutral"
        class="lg:hidden fixed top-13 right-4 z-30"
        @click="sidebarOpen = !sidebarOpen"
      >
        ☰
      </UButton>

      <div v-show="!sidebarOpen || width > 1024" class="flex-1 w-full">
        <MainChat v-show="!isVoiceMode" v-model="isVoiceMode" />
        <VoiceChat v-show="isVoiceMode" v-model="isVoiceMode" />
      </div>
    </div>
  </div>
</template>

<style>
.animated-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
}

.blob {
  position: absolute;
  width: 300px;
  height: 300px;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: float 15s infinite ease-in-out;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40px, -60px) scale(1.2);
  }
  66% {
    transform: translate(-40px, 40px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}
</style>
