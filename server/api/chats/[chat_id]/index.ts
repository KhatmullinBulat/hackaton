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

  const body = await readBody(event);

  const targetUrl = `http://127.0.0.1:9090/chats/${chatId}`;

  try {
    const response = await $fetch<Chat>(targetUrl, {
      method: "PATCH",
      body,
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
