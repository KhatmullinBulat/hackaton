export const useVoiceRecorder = () => {
  const isRecording = ref(false);
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.start();
    isRecording.value = true;
  }

  async function stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!mediaRecorder) return;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        isRecording.value = false;
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }

  return { isRecording, start, stop };
};
