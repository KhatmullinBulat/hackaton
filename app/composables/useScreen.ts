export function useScreen() {
  const width = ref(import.meta.client ? window.innerWidth : 0);

  function update() {
    width.value = window.innerWidth;
  }

  if (import.meta.client) {
    window.addEventListener("resize", update);
    onBeforeUnmount(() => {
      window.removeEventListener("resize", update);
    });
  }

  return { width };
}
