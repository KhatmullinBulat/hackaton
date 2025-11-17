<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Почта",
    placeholder: "Введите свою почту",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Пароль",
    placeholder: "Введите свой пароль",
    required: true,
  },
];

const schema = z.object({
  email: z.email("Неверный адрес электронной почты"),
  password: z
    .string("Требуется пароль")
    .min(8, "Должно быть не менее 8 символов."),
});

type Schema = z.output<typeof schema>;

const { register } = useAuthApi();

const pending = ref(false);
const error = ref<unknown | null>(null);

const handleSubmit = async (payload: FormSubmitEvent<Schema>) => {
  pending.value = true;
  error.value = null;

  try {
    const response = await register({
      email: payload.data.email,
      password: payload.data.password,
    });

    if (response) {
      toast.add({
        color: "success",
        title: "Успешная регистрация!",
      });
      navigateTo("/chat");
    } else {
      throw new Error("В ответе на регистрацию отсутствуют обязательные поля");
    }
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
};
</script>

<template>
  <div class="size-full flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Регистрация"
        description="Введите свои учетные данные для регистрации."
        icon="i-lucide-user"
        :fields="fields"
        @submit="handleSubmit"
      >
        <template #submit>
          <UButton type="submit" color="primary" class="w-full">
            Продолжить
          </UButton>
        </template>

        <template #footer>
          <button
            class="text-xs pl-2 mb-3 cursor-pointer hover:text-blue-500"
            @click="navigateTo('/login')"
          >
            Уже есть аккаунт?
          </button>
          <div class="text-center text-xs text-gray-400 dark:text-gray-500">
            © {{ new Date().getFullYear() }} Биониклы
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
