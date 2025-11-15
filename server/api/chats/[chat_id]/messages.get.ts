interface Chat {
  id: string;
  title: string;
  folder_id: string;
  created_at: string;
  updated_at: string;
}

export default defineEventHandler(async (event) => {
  const chatId = getRouterParam(event, "chat_id");

  if (!chatId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Параметр 'chat_id' обязателен",
    });
  }

  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/chats/${chatId}/messages`;

  const query = getQuery(event);

  try {
    const response = await $fetch<Chat>(targetUrl, {
      method: "GET",
      params: query,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Ошибка при запросе к AI сервису:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера при обращении к AI сервису",
    });
  }
});
