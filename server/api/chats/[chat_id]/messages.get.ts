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
