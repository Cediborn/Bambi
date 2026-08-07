import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/db/AppProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { BootGate } from "@/components/loading/BootGate";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";

/* Typography — all three fonts are downloaded once at build time and
   self-hosted, so there are no runtime requests and no layout shift.
   - Space Grotesk: headings / wordmarks (--font-grotesk)
   - Inter: body text (--font-inter)
   - JetBrains Mono: numbers, stats, timers (--font-jetbrains) */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BAMBI — small things, done daily",
    template: "%s · BAMBI",
  },
  description:
    "A calm place for students to build habits, keep streaks, and reflect. No inbox, no noise — just small things, done daily.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BAMBI",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

/** PWA viewport: tinted browser chrome per theme, notch-safe standalone layout. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
    { media: "(prefers-color-scheme: light)", color: "#F6F3EA" },
  ],
  viewportFit: "cover",
};

/**
 * Apply the stored theme before first paint to avoid a flash of the
 * wrong theme. The authoritative state lives in AppProvider; this
 * script only reads the persisted preference synchronously.
 */
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("bambi:theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AppProvider>
          <AuthProvider>
            <BootGate>{children}</BootGate>
          </AuthProvider>
          <PwaRegistrar />
        </AppProvider>
      </body>
    </html>
  );
}
