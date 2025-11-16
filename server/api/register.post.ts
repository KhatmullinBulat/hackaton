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

  const response = await $fetch<RegisterResponse>(targetUrl, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;

  // try {

  //   return response;
  // } catch (error) {
  //   console.error("Ошибка при запросе к AUTH сервису:", error);
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: "Внутренняя ошибка сервера при обращении к AUTH сервису",
  //   });
  // }
});
