import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SmoothAnchors } from "@/components/smooth-anchors";
import { InterviewProvider } from "@/components/interview/interview-provider";
import { InterviewFab } from "@/components/interview/interview-fab";
import { getAllPosts } from "@/lib/content";
import { site } from "@/content/site";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hasWriting = (await getAllPosts()).length > 0;

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-lime focus:px-4 focus:py-2 focus:text-lime-ink"
        >
          Skip to content
        </a>
        <InterviewProvider>
          <SiteHeader hasWriting={hasWriting} />
          <main id="main">{children}</main>
          <SiteFooter />
          <InterviewFab />
        </InterviewProvider>
        <SmoothAnchors />
        <Analytics />
      </body>
    </html>
  );
}
