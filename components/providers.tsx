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
      <Toaster 
        position="top-center"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          className: "!rounded-xl !shadow-2xl !border !backdrop-blur-sm",
          style: {
            background: "var(--background)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
          classNames: {
            toast: "!rounded-xl !shadow-2xl !border !backdrop-blur-sm !px-6 !py-4 !min-w-[320px] !max-w-[500px]",
            title: "!font-semibold !text-base",
            description: "!text-sm !opacity-90",
            success: "!bg-gradient-to-r !from-green-50 !to-emerald-50 !dark:from-green-950/30 !dark:to-emerald-950/30 !border-green-200 !dark:border-green-800",
            error: "!bg-gradient-to-r !from-red-50 !to-rose-50 !dark:from-red-950/30 !dark:to-rose-950/30 !border-red-200 !dark:border-red-800",
            warning: "!bg-gradient-to-r !from-yellow-50 !to-amber-50 !dark:from-yellow-950/30 !dark:to-amber-950/30 !border-yellow-200 !dark:border-yellow-800",
            info: "!bg-gradient-to-r !from-blue-50 !to-cyan-50 !dark:from-blue-950/30 !dark:to-cyan-950/30 !border-blue-200 !dark:border-blue-800",
            actionButton: "!bg-primary !text-primary-foreground !rounded-lg !px-4 !py-2 !font-medium",
            cancelButton: "!bg-muted !text-muted-foreground !rounded-lg !px-4 !py-2 !font-medium",
          },
        }}
      />
    </ThemeProvider>
  );
}

