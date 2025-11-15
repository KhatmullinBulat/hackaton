export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;
  const { refresh, loadFromLocalStorage } = useAuthApi();
  const accessToken = useState<string | null>("access-token");
  const expiresAt = useState<number | null>("expires-at");

  loadFromLocalStorage();

  const isRefreshing = ref(false);

  const origFetch = $fetch;

  globalThis.$fetch = async (url, opts = {}) => {
    const now = Date.now();
    const exp = expiresAt.value;

    if (exp && exp - now < 60 * 1000) {
      if (!isRefreshing.value) {
        isRefreshing.value = true;
        await refresh();
        isRefreshing.value = false;
      }
    }

    opts.headers = {
      ...(opts.headers || {}),
      Authorization: accessToken.value ? `Bearer ${accessToken.value}` : "",
    };

    return origFetch(url, opts);
  };
});
