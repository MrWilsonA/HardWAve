import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "HardWAve — Decentralized Hardware Provenance";
const DESCRIPTION =
  "An open-world 3D Web3 provenance ecosystem: drive an arcade buggy across a living island, inspect exploded hardware digital twins, mine a sovereign SHA-256 blockchain, and trade tokenized components.";

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s • HardWAve",
  },
  description: DESCRIPTION,
  applicationName: "HardWAve",
  keywords: [
    "Web3",
    "hardware provenance",
    "digital twin",
    "ERC-721",
    "blockchain",
    "Three.js",
    "counterfeit detection",
    "warranty",
  ],
  authors: [{ name: "HardWAve" }],
  openGraph: {
    type: "website",
    siteName: "HardWAve",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  // The 3D world handles its own zoom; pinch-zooming the page breaks the HUD.
  maximumScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
