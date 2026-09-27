import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientProvider from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "InSafe — Safety is Freedom",
  description: "InSafe personal safety platform. Trigger SOS alerts, share live location with emergency contacts, use fake calls, and stay safe with community-powered safety features.",
  keywords: ["safety", "women safety", "SOS", "emergency", "location sharing", "InSafe"],
  authors: [{ name: "InSafe" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProvider>
          <div className="mobile-shell">
            {children}
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
