export interface LoginResponse {
  AccessToken: string;
  RefreshToken: string;
  ExpiresAt: string;
  UserID: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const targetUrl = "http://localhost:8090/auth/login";

  try {
    const response = await $fetch<LoginResponse>(targetUrl, {
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
