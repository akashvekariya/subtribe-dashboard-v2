import type { Metadata } from "next";
import {
  Instrument_Sans,
  IBM_Plex_Mono,
  Instrument_Serif,
} from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "devicon/devicon.min.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Subtribe Dashboard | Manage Your Hiring Pipeline",
  description:
    "Manage your hiring pipeline with AI-powered candidate screening and evaluation. Built for modern recruiting teams.",
  keywords: [
    "ATS",
    "dashboard",
    "recruitment",
    "hiring",
    "AI",
    "candidate screening",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
      </head>
      <body
        className={`${instrumentSans.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
