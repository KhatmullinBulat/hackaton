interface Folder {
  id: string;
  title: string;
  created_at: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/folders`;

  const query = getQuery(event);

  const response = await $fetch<Folder>(targetUrl, {
    method: "GET",
    params: query,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;

  // try {
  //   const response = await $fetch<Folder>(targetUrl, {
  //     method: "GET",
  //     params: query,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   return response;
  // } catch (error) {
  //   console.error("Ошибка при запросе к AI сервису:", error);
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: "Внутренняя ошибка сервера при обращении к AI сервису",
  //   });
  // }
});
