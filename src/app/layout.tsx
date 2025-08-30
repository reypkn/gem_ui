import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gem UI - Chat with Gemini",
  description: "A beautiful chat interface for Google's Gemini AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
