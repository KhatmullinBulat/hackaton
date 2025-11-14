<script setup lang="ts">
interface ITokenResponse {
  token: string;
}

const toast = useToast();

const form = reactive({ email: "", password: "" });

async function register() {
  const { data, error } = await useFetch<ITokenResponse>("/api/auth/login", {
    method: "POST",
    body: form,
  });

  if (error.value) {
    console.error("Login failed:", error.value);
    toast.add({
      title: "Ошибка",
      description: "Попробуйте снова.",
      color: "error",
    });
    return;
  }

  if (data.value?.token) {
    localStorage.setItem("jwtToken", data.value.token);
    navigateTo("/");
  } else {
    toast.add({
      title: "Ошибка",
      description: "Неверный ответ от сервера.",
      color: "error",
    });
  }
}
</script>

<template>
  <div
    class="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <UCard class="w-full max-w-md shadow-xl rounded-2xl p-6 space-y-6">
      <div class="text-center space-y-2 mb-6">
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Регистрация
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Введите ваши данные для регистрации
        </p>
      </div>

      <UForm :state="form" class="mb-8" @submit="register">
        <UFormField label="Почта" size="xl" name="email" class="mb-3">
          <UInput
            v-model="form.email"
            size="xl"
            class="w-full"
            placeholder="example@mail.com"
          />
        </UFormField>

        <UFormField label="Пароль" size="xl" name="password" class="mb-6">
          <UInput
            v-model="form.password"
            type="password"
            size="xl"
            class="w-full"
            placeholder="••••••••"
          />
        </UFormField>

        <UButton color="secondary" size="lg" class="w-full mb-3">
          Регистрация
        </UButton>

        <NuxtLink
          to="/login"
          class="text-[12px] hover:text-blue-300 transition-colors"
          >Уже есть аккаунт?</NuxtLink
        >
      </UForm>

      <div class="text-center text-xs text-gray-400 dark:text-gray-500">
        © {{ new Date().getFullYear() }} Биониклы
      </div>
    </UCard>
  </div>
</template>
