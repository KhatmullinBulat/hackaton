import { defineEventHandler, sendStream, readBody, setHeader } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/ai/ai/tts`;

  const body = await readBody(event);

  try {
    const fetchOptions: RequestInit = {
      method: event.method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok || !response.body) {
      throw new Error("Ошибка от Python бэкенда: " + response.statusText);
    }

    setHeader(
      event,
      "Content-Type",
      response.headers.get("Content-Type") || "audio/mpeg"
    );

    return sendStream(event, response.body);

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

// export default defineEventHandler(async (event) => {
//   const config = useRuntimeConfig(event);
//   const targetUrl = `${config.public.api.aiBase}/ai/ai/tts`;

//   const body = await readBody(event);

//   const fetchOptions: RequestInit = {
//     method: event.method,
//     body: JSON.stringify(body),
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };

//   const pythonResponse = await fetch(targetUrl, fetchOptions);

//   if (!pythonResponse.ok || !pythonResponse.body) {
//     throw new Error("Ошибка от Python бэкенда: " + pythonResponse.statusText);
//   }

//   setHeader(
//     event,
//     "Content-Type",
//     pythonResponse.headers.get("Content-Type") || "audio/mpeg"
//   );

//   return sendStream(event, pythonResponse.body);
// });
