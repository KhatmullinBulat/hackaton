interface GptResponse {
  chat_id: string;
  reply: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const targetUrl = "http://127.0.0.1:9090/ai/interpret";

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
