import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/contexts/ModeContext";
import { QuizProvider } from "@/contexts/QuizContext";

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
        <ModeProvider>
          <QuizProvider>{children}</QuizProvider>
        </ModeProvider>
      </body>
    </html>
  );
}

