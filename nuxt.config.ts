// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui"],
  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },
  css: ["~/assets/css/tailwind.css", "~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      api: {
        base: process.env.API_BASE || "https://auth-service.example.com/api",
      },
    },
  },
});
