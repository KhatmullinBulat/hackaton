export function useScreen() {
  const width = ref(process.client ? window.innerWidth : 0);

  function update() {
    width.value = window.innerWidth;
  }

  if (process.client) {
    window.addEventListener("resize", update);
    onBeforeUnmount(() => {
      window.removeEventListener("resize", update);
    });
  }

  return { width };
}
