import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus HQ — XOR | LAEC Bidar",
  description:
    "Explore the XOR Campus HQ at Lingaraj Appa Engineering College (LAEC), Bidar—where student engineers run weekly labs, workshops, and open hardware demos.",
  openGraph: {
    title: "Campus HQ — XOR | LAEC Bidar",
    description:
      "Explore the XOR Campus HQ at Lingaraj Appa Engineering College (LAEC), Bidar—where student engineers run weekly labs, workshops, and open hardware demos.",
  },
};

export default function CampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
