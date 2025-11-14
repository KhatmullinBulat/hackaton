<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

// interface ITokenResponse {
//   token: string;
// }

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

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  // const { data, error } = await useFetch<ITokenResponse>("/api/auth/login", {
  //   method: "POST",
  //   body: payload.data,
  // });

  // if (error.value) {
  //   console.error("Login failed:", error.value);
  //   toast.add({
  //     title: "Ошибка",
  //     description: "Попробуйте снова.",
  //     color: "error",
  //   });
  //   return;
  // }

  navigateTo("/chat");

  // if (data.value?.token) {
  //   localStorage.setItem("jwtToken", data.value.token);
  //   navigateTo("/chat");
  // } else {
  //   toast.add({
  //     title: "Ошибка",
  //     description: "Неверный ответ от сервера.",
  //     color: "error",
  //   });
  // }
}
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
        @submit="onSubmit"
      >
        <template #submit>
          <UFieldGroup class="w-full flex justify-center">
            <UButton type="submit" color="primary"> Продолжить </UButton>
            <UButton color="secondary" @click="navigateTo('/register')">
              Регистрация
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
