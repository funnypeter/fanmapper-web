import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FanMapper — Track Games. Explore Wikis. Map Worlds.",
  description: "Game library tracker with Fandom wiki integration, interactive maps, achievement sync, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
