import type { MetadataRoute } from "next";

/** Web app manifest — lets visitors install BAMBI to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BAMBI — small things, done daily",
    short_name: "BAMBI",
    description:
      "A calm place for students to build habits, keep streaks, and grow a tree. No inbox, no noise.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    categories: ["productivity", "health", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
