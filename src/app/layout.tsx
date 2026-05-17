import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import AnimatedBackground from "../components/AnimatedBackground";

export const metadata: Metadata = {
  title: "LEADSORA — Find Buying Intent Before Your Competitors",
  description: "AI-powered lead intelligence that detects real buying intent across the web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <AnimatedBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
