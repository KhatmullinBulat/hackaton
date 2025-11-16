interface GptResponse {
  chat_id: string;
  reply: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/ai/ai/interpret`;

  const body = await readBody(event);

  try {
    const response = await $fetch<GptResponse>(targetUrl, {
      method: "POST",
      body: body,
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
