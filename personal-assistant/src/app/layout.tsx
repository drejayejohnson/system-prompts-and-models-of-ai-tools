import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";
import { SessionProvider } from "@/components/ui/SessionProvider";

export const metadata: Metadata = {
  title: "Personal Assistant",
  description: "Your AI-powered business assistant",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#e8836a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-warm-50">
        <SessionProvider>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
