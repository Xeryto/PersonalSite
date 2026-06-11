import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
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
    <html lang="en" className={`${spaceGrotesk.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
