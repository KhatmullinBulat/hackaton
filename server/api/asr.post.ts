export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const form = await readMultipartFormData(event);

  const audioFile = form?.find((f) => f.name === "audio");
  if (!audioFile) {
    throw createError({
      statusCode: 400,
      message: "Поле 'audio' обязательно",
    });
  }

  const fd = new FormData();
  fd.append(
    "audio",
    new Blob([audioFile.data], { type: audioFile.type }),
    audioFile.filename ?? "audio.ogg"
  );

  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/ai/asr`;

  try {
    const response = await $fetch(targetUrl, {
      method: "POST",
      body: fd,
      params: query,
    });
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Ошибка при запросе к ASR сервису:", error.data);
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.detail || "Ошибка при обращении к ASR сервису",
    });
  }
});
