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
        closeButton={false}
        toastOptions={{
          duration: 4000,
          className: "!rounded-2xl !shadow-2xl !border-2 !backdrop-blur-md !ring-1 !ring-black/5",
          style: {
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          },
          classNames: {
            toast: "!rounded-2xl !shadow-2xl !border-2 !backdrop-blur-md !ring-1 !ring-black/5 !pl-14 !pr-6 !pt-5 !pb-5 !min-w-[360px] !max-w-[500px] !sm:min-w-[380px] !sm:max-w-[520px] !relative !overflow-hidden !flex !items-start !gap-3",
            title: "!font-semibold !text-base !mb-1 !leading-tight !flex-1 !text-black",
            description: "!text-sm !opacity-90 !leading-relaxed !flex-1 !text-black",
            closeButton: "!flex-shrink-0 !w-8 !h-8 !rounded-xl !bg-gradient-to-br !from-red-500/20 !to-red-600/20 !hover:from-red-500/30 !hover:to-red-600/30 !dark:from-red-500/30 !dark:to-red-600/30 !dark:hover:from-red-500/40 !dark:hover:to-red-600/40 !flex !items-center !justify-center !transition-all !duration-300 !hover:scale-110 !border !border-red-500/30 !hover:border-red-500/50 !shadow-sm !hover:shadow-md",
            success: "!bg-gradient-to-br !from-green-50 !via-emerald-50 !to-green-100 !dark:from-green-950/40 !dark:via-emerald-950/40 !dark:to-green-950/60 !border-green-200/60 !dark:border-green-800/60 !shadow-green-500/10",
            error: "!bg-gradient-to-br !from-red-50 !via-rose-50 !to-red-100 !dark:from-red-950/40 !dark:via-rose-950/40 !dark:to-red-950/60 !border-red-200/60 !dark:border-red-800/60 !shadow-red-500/10",
            warning: "!bg-gradient-to-br !from-yellow-50 !via-amber-50 !to-yellow-100 !dark:from-yellow-950/40 !dark:via-amber-950/40 !dark:to-yellow-950/60 !border-yellow-200/60 !dark:border-yellow-800/60 !shadow-yellow-500/10",
            info: "!bg-gradient-to-br !from-blue-50 !via-cyan-50 !to-blue-100 !dark:from-blue-950/40 !dark:via-cyan-950/40 !dark:to-blue-950/60 !border-blue-200/60 !dark:border-blue-800/60 !shadow-blue-500/10",
            actionButton: "!bg-primary !text-primary-foreground !rounded-xl !px-5 !py-2.5 !font-semibold !shadow-lg !hover:shadow-xl !transition-all !duration-200 !hover:scale-105 !mt-3",
            cancelButton: "!bg-muted/80 !text-muted-foreground !rounded-xl !px-5 !py-2.5 !font-medium !hover:bg-muted !transition-colors !duration-200 !mt-3",
          },
        }}
      />
    </ThemeProvider>
  );
}

