import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";

const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "900"], variable: "--font-poppins" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.site_title, description: s.site_description, icons: { icon: s.favicon_url || "/logo.svg" } };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const css = `:root{--color-primary:${s.color_primary};--color-gradient-start:${s.color_gradient_start};--color-gradient-end:${s.color_gradient_end};--color-secondary:${s.color_secondary};--color-btn:${s.color_btn};--color-card:${s.color_card};--color-footer:${s.color_footer};--color-panel:${s.color_panel};--color-nav:${s.color_nav};--color-nav-text:${s.color_nav_text};--color-field:${s.color_field};--color-field-text:${s.color_field_text};--color-main:${s.color_main};--color-page:${s.color_page}}`;
  return (
    <html lang="pt-BR">
      <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body className={`${poppins.variable} text-main antialiased`}>{children}</body>
    </html>
  );
}
