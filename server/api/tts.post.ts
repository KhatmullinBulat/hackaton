export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.text) {
    throw createError({
      statusCode: 400,
      message: "Поле 'text' обязательно",
    });
  }

  const targetUrl = "http://127.0.0.1:9090/ai/tts";

  try {
    const arrayBuffer = await $fetch<ArrayBuffer>(targetUrl, {
      method: "POST",
      body,
      responseType: "arrayBuffer",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Устанавливаем корректный Content-Type
    setResponseHeaders(event, {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(arrayBuffer.byteLength),
    });

    return arrayBuffer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Ошибка при запросе к TTS сервису:", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      message: error?.data?.message || "Ошибка при обращении к TTS сервису",
    });
  }
});
