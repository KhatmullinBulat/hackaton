export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  const file = form?.find((f) => f.name === "file");
  if (!file) {
    throw createError({
      statusCode: 400,
      message: "file обязателен",
    });
  }

  const fd = new FormData();
  fd.append(
    "audio",
    new Blob([file.data], { type: file.type }),
    file.filename ?? "audio.wav"
  );

  const response = await $fetch("http://127.0.0.1:9090/asr", {
    method: "POST",
    body: fd,
  });

  return response;
});
