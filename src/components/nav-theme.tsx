"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function NavTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const { state } = useSidebar();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  };

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {state === "collapsed" ? (
          // Collapsed state - show icon only with tooltip
          <SidebarMenuButton
            tooltip={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            className="min-h-12 min-w-full text-center justify-center text-white hover:bg-transparent hover:text-white"
            onClick={() => toggleTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </SidebarMenuButton>
        ) : (
          // Expanded state - show full theme toggle buttons
          <SidebarMenuButton 
            asChild 
            className="w-full h-11 mt-5 hover:bg-transparent active:bg-transparent focus:bg-transparent data-[active=true]:bg-transparent"
          >
            <div className="flex flex-1 h-11 items-center rounded-full overflow-hidden px-2">
              {/* Light Button */}
              <button
                onClick={() => toggleTheme("light")}
                className={`flex flex-1 h-11 items-center gap-3 px-3 py-1.5 text-sm justify-center font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-white text-black shadow-sm"
                    : "text-white"
                } rounded-full`}
              >
                <Sun className={`h-5 w-5 ${theme === "light" ? "text-[#303030]" : "text-white"}`} />
                Light
              </button>

              {/* Dark Button */}
              <button
                onClick={() => toggleTheme("dark")}
                className={`flex flex-1 h-11 items-center gap-3 px-3 py-1.5 text-sm justify-center font-medium transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-white text-[#303030] shadow-sm"
                    : "text-white"
                } rounded-full`}
              >
                <Moon className={`h-5 w-5 ${theme === "dark" ? "text-[#303030]" : "text-white"}`} />
                Dark
              </button>
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}