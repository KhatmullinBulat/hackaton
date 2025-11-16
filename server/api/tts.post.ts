import { defineEventHandler, sendStream, readBody, setHeader } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const targetUrl = `${config.public.api.aiBase}/ai/ai/tts`;

  const body = await readBody(event);

  const fetchOptions: RequestInit = {
    method: event.method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const pythonResponse = await fetch(targetUrl, fetchOptions);

  if (!pythonResponse.ok || !pythonResponse.body) {
    throw new Error("Ошибка от Python бэкенда: " + pythonResponse.statusText);
  }

  setHeader(
    event,
    "Content-Type",
    pythonResponse.headers.get("Content-Type") || "audio/mpeg"
  );
  setHeader(event, "Transfer-Encoding", "chunked");

  return sendStream(event, pythonResponse.body);

  // try {
  //   if (!pythonResponse.ok || !pythonResponse.body) {
  //     throw new Error("Ошибка от Python бэкенда: " + pythonResponse.statusText);
  //   }

  //   setHeader(
  //     event,
  //     "Content-Type",
  //     pythonResponse.headers.get("Content-Type") || "audio/mpeg"
  //   );
  //   setHeader(event, "Transfer-Encoding", "chunked");

  //   return sendStream(event, pythonResponse.body);
  // } catch (error) {
  //   console.error("Ошибка прокси:", error);
  //   return { error: "Не удалось получить стрим: " + (error as Error).message };
  // }
});
