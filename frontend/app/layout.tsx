import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/contexts/ModeContext";

export const metadata: Metadata = {
  title: "LiveKit Voice Agent",
  description: "Voice agent with visual UI control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}

