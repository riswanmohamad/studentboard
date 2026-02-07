import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/posthog-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudentBoard - Study smarter. Pass your exams.",
  description:
    "Organize your studies with Kanban boards, track progress, and pass your exams with confidence.",
  keywords: ["study", "exam", "kanban", "student", "Sri Lanka", "O/L"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-dvh`}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
