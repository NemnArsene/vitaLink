import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useTheme() {
  const theme = useAuthStore(s => s.theme);
  const toggleTheme = useAuthStore(s => s.toggleTheme);
  const setTheme = useAuthStore(s => s.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return { theme, toggleTheme, setTheme };
}