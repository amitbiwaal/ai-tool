"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme={isAdmin ? "light" : "system"} 
      enableSystem={!isAdmin}
      storageKey={isAdmin ? "admin-theme" : "theme"}
      forcedTheme={isAdmin ? "light" : undefined}
    >
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

