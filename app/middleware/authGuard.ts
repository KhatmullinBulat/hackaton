export default defineNuxtRouteMiddleware(() => {
  const { userId } = useAuthApi();
  const isAuth = userId.value;

  if (!isAuth) {
    return navigateTo("/login");
  }
});
