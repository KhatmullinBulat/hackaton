export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return;

  const { loadFromLocalStorage } = useAuthApi();
  const accessToken = useState<string | null>("access-token");

  if (!accessToken.value) {
    loadFromLocalStorage();
  }

  if (accessToken.value && (to.path === "/login" || to.path === "/register")) {
    return navigateTo("/");
  }
});
