import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { BRAND_CONFIG } from "@/data/psyctech";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";

const inter = Inter({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE_DEFAULT = "XOR — Student Technical Club | LAEC Bidar";
const SITE_DESCRIPTION = `${BRAND_CONFIG.name} student engineering club portal at ${BRAND_CONFIG.institution}. Claim your virtual ID pass, collaborate on builds, and join campus workshops.`;

export const metadata: Metadata = {
  metadataBase: new URL("https://xorclub.in"),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  icons: [
    {
      rel: "icon",
      url: "/icon.svg",
      type: "image/svg+xml",
    },
  ],
  authors: [{ name: "XOR — Student Technical Club" }],
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    siteName: BRAND_CONFIG.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-[#162323] text-[#EFE7E4] font-sans antialiased selection:bg-[#BC806A]/25 selection:text-[#EFE7E4] overflow-x-clip">
        <AuthProvider>
          <ScrollProgress />
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
