"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
  } catch (error) {
    console.warn("Theme provider failed to initialize:", error);
    // Fallback to light theme if storage access fails
    return (
      <div data-theme="light" className="light">
        {children}
      </div>
    );
  }
}
