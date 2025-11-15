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
        authBase: process.env.AUTH_BASE_URL || "https://hackathon-sonnik.ru",
        aiBase: process.env.AI_BASE_URL || "https://hackathon-sonnik.ru/ai",
      },
    },
  },
});
