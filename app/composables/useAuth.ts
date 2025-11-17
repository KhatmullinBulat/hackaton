// Типы для запроса
interface RequestPayload {
  email: string;
  password: string;
}

// Типы для ответа
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user_id: string;
}

export const useAuthApi = () => {
  const accessToken = useState<string | null>("access-token", () => null);
  const refreshToken = useState<string | null>("refresh-token", () => null);
  const userId = useState<string | null>("user-id", () => null);
  const expiresAt = useState<number | null>("expires-at", () => null);

  const isAuthenticated = computed(() => !!accessToken.value);

  const login = async (payload: RequestPayload) => {
    try {
      const response = await $fetch<string>("/api/login", {
        method: "POST",
        body: payload,
      });

      const data: AuthResponse = JSON.parse(response);

      if (!data) return null;

      accessToken.value = data.access_token;
      refreshToken.value = data.refresh_token;
      userId.value = data.user_id;
      expiresAt.value = new Date(data.expires_at).getTime();

      saveToLocalStorage();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (payload: RequestPayload) => {
    try {
      const response = await $fetch<string>("/api/register", {
        method: "POST",
        body: payload,
      });

      const data: AuthResponse = JSON.parse(response);

      if (!data) return null;

      accessToken.value = data.access_token;
      refreshToken.value = data.refresh_token;
      userId.value = data.user_id;
      expiresAt.value = new Date(data.expires_at).getTime();

      saveToLocalStorage();
      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const refresh = async () => {
    if (!refreshToken.value) return null;

    try {
      const response = await $fetch<string>("/api/refresh", {
        method: "POST",
        body: { RefreshToken: refreshToken.value },
      });

      const data: AuthResponse = JSON.parse(response);

      accessToken.value = data.access_token;
      refreshToken.value = data.refresh_token;
      userId.value = data.user_id;
      expiresAt.value = new Date(data.expires_at).getTime();

      saveToLocalStorage();
      return data;
    } catch (error) {
      console.error("Refresh error:", error);
      throw error;
    }
  };

  function saveToLocalStorage() {
    if (import.meta.client) {
      localStorage.setItem("access_token", accessToken.value ?? "");
      localStorage.setItem("refresh_token", refreshToken.value ?? "");
      localStorage.setItem("user_id", userId.value ?? "");
      localStorage.setItem("expires_at", String(expiresAt.value ?? ""));
    }
  }

  function loadFromLocalStorage() {
    if (import.meta.client) {
      accessToken.value = localStorage.getItem("access_token");
      refreshToken.value = localStorage.getItem("refresh_token");
      userId.value = localStorage.getItem("user_id");

      const exp = localStorage.getItem("expires_at");
      expiresAt.value = exp ? Number(exp) : null;
    }
  }

  return {
    login,
    register,
    refresh,
    userId,
    saveToLocalStorage,
    loadFromLocalStorage,
    isAuthenticated,
  };
};
