export interface RegisterResponse {
  AccessToken: string;
  RefreshToken: string;
  ExpiresAt: string;
  UserID: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.authBase}/auth/register`;

  const body = await readBody(event);

  try {
    const response = await $fetch<RegisterResponse>(targetUrl, {
      method: "POST",
      body,
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
