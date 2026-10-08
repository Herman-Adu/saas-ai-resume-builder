import { env } from "@/env";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-face",
});

const description =
  "Orbit CV is an AI resume builder. Fill in your details, let the AI draft your summary and work experience, watch the page update live and export a print-ready PDF.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: {
    template: "%s | Orbit CV",
    absolute: "Orbit CV: AI resume builder",
  },
  description,
  applicationName: "Orbit CV",
  openGraph: {
    type: "website",
    siteName: "Orbit CV",
    title: "Orbit CV: AI resume builder",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit CV: AI resume builder",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e13" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${display.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
