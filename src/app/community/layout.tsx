import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Broadcast Channel — XOR",
  description:
    "Official broadcast channel for XOR Club Leads to post verified announcements, workshop alerts, and campus event pitches at LAEC Bidar.",
  openGraph: {
    title: "Official Broadcast Channel — XOR",
    description:
      "Official broadcast channel for XOR Club Leads to post verified announcements, workshop alerts, and campus event pitches at LAEC Bidar.",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
