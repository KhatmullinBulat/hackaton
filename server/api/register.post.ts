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
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Ошибка при запросе к AUTH сервису:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера при обращении к AUTH сервису",
    });
  }
});
