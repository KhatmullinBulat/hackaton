interface Folder {
  id: string;
  title: string;
  created_at: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/folders`;

  const query = getQuery(event);

  try {
    const response = await $fetch<Folder>(targetUrl, {
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
