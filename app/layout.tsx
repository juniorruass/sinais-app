import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";

const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "900"], variable: "--font-poppins" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.site_title, description: s.site_description, icons: { icon: s.favicon_url || "/favicon.ico" } };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const css = `:root{--color-primary:${s.color_primary};--color-gradient-start:${s.color_gradient_start};--color-gradient-end:${s.color_gradient_end};--color-secondary:${s.color_secondary}}`;
  return (
    <html lang="pt-BR">
      <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body className={`${poppins.variable} text-white antialiased`}>{children}</body>
    </html>
  );
}
