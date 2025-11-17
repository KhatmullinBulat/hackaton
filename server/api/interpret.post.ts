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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("External login API error:", error);

    const message = error?.data?.message || error?.message || "Unknown error";

    throw createError({
      statusCode: error?.statusCode || 400,
      statusMessage: message,
      data: error?.data || null,
    });
  }
});
