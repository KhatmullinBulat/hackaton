<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

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
  {
    name: "remember",
    label: "Запомнить меня",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "Войти через Google" });
    },
  },
];

const schema = z.object({
  email: z.email("Неверный адрес электронной почты"),
  password: z
    .string("Требуется пароль")
    .min(8, "Должно быть не менее 8 символов."),
});

type Schema = z.output<typeof schema>;

const { login } = useAuthApi();

const pending = ref(false);
const error = ref<unknown | null>(null);

const handleSubmit = async (payload: FormSubmitEvent<Schema>) => {
  pending.value = true;
  error.value = null;

  try {
    const response = await login({
      email: payload.data.email,
      password: payload.data.password,
    });

    if (response) {
      toast.add({
        color: "success",
        title: "Успешный вход!",
      });
      navigateTo("/chat");
    } else {
      throw new Error("В ответе на вход отсутствуют обязательные поля");
    }
  } catch (e: unknown) {
    console.error("Registration error:", e);

    let message = "Что-то пошло не так.";

    // если это FetchError или Error, возьмём нормальный текст
    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }

    toast.add({
      color: "error",
      title: "Ошибка входа",
      description: message, // всегда строка
    });

    // для логики приложения можно сохранить в error.value
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
        title="Вход"
        description="Введите свои учетные данные для доступа к вашей учетной записи."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="handleSubmit"
      >
        <template #submit>
          <UFieldGroup class="w-full flex justify-center">
            <UButton type="submit" color="primary" class="w-full">
              <p class="text-center w-full">Продолжить</p>
            </UButton>
            <UButton
              color="secondary"
              class="w-full"
              @click="navigateTo('/register')"
            >
              <p class="text-center w-full">Регистрация</p>
            </UButton>
          </UFieldGroup>
        </template>

        <template #footer>
          <div class="text-center text-xs text-gray-400 dark:text-gray-500">
            © {{ new Date().getFullYear() }} Биониклы
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
