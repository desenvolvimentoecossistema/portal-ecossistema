import type { Metadata } from "next";
import "./globals.css";
import PortalNavigation from "@/components/portal-navigation";
import { siteSignOutPath } from "@/app/site-auth";
import { portalFonts,portalFontFaceCSS } from "@/lib/portal-fonts";

export const metadata: Metadata = {
  title: "Portal do Ecossistema | Fundação Lemann",
  description: "Organizações, imersões e programas do Ecossistema.",
  icons: {
    icon: [{ url: "/favicon-ecosystem.png", type: "image/png", sizes: "any" }],
    shortcut: "/favicon-ecosystem.png",
    apple: "/favicon-ecosystem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {portalFonts.map(font=><link key={font.family} rel="preload" href={font.href} as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="high"/>)}
        <style dangerouslySetInnerHTML={{__html:portalFontFaceCSS}}/>
      </head>
      <body className="antialiased"><PortalNavigation signOutPath={siteSignOutPath()} />{children}</body>
    </html>
  );
}
