import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jbmono",
});

export const metadata: Metadata = {
  title: "Daniel Igoshin — Software Engineer",
  description:
    "Software engineer and CS student at Columbia University. Building impactful software across full-stack, SRE, and machine learning.",
  openGraph: {
    title: "Daniel Igoshin — Software Engineer",
    description:
      "Software engineer and CS student at Columbia University. Building impactful software across full-stack, SRE, and machine learning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
