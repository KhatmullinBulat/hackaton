export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return; // SSR: ничего не делаем

  const { loadFromLocalStorage } = useAuthApi();
  const accessToken = useState<string | null>("access-token");

  // подгружаем токены
  if (!accessToken.value) {
    loadFromLocalStorage();
  }

  // Если после загрузки токен всё ещё нет → редирект
  if (
    !accessToken.value &&
    to.path !== "/login" &&
    to.path !== "/register" &&
    to.path !== "" &&
    to.path !== "/"
  ) {
    return navigateTo("/login");
  }
});
