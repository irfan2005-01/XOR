import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Member ID Card — XOR",
  description:
    "Claim, inspect, flip, and download your verified XOR-26-XXXX student member pass with cryptographic QR verification for LAEC Bidar.",
  openGraph: {
    title: "My Member ID Card — XOR",
    description:
      "Claim, inspect, flip, and download your verified XOR-26-XXXX student member pass with cryptographic QR verification for LAEC Bidar.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
