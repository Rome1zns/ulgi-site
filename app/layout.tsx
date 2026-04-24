import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { kk } from "@/lib/locale/kk";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      "http://localhost:3000"
  ),
  title: {
    default: kk.meta.title,
    template: kk.meta.titleTemplate,
  },
  description: kk.meta.description,
  openGraph: {
    title: kk.meta.ogTitle,
    description: kk.meta.ogDescription,
    siteName: kk.meta.siteName,
    locale: "kk_KZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk" className={nunito.variable}>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
