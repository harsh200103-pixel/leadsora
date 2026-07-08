import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import AnimatedBackground from "../components/AnimatedBackground";

export const metadata: Metadata = {
  title: "ISAI LEADS — Find Buying Intent Before Your Competitors",
  description: "AI-powered lead intelligence that detects real buying intent across the web. Built by ISAI Tech Solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Inline script: sets data-theme BEFORE first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('isai_leads_theme_v2');
                  var theme = saved === 'dark' ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
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
