interface Chat {
  id: string;
  title: string;
  folder_id: string;
  created_at: string;
  updated_at: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/chats`;

  const body = await readBody(event);

  const response = await $fetch<Chat>(targetUrl, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;

  // try {

  // } catch (error) {
  //   console.error("Ошибка при запросе к AI сервису:", error);
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: "Внутренняя ошибка сервера при обращении к AI сервису",
  //   });
  // }
});
