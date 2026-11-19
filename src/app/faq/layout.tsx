import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & Knowledge Base — XOR",
  description:
    "Common questions regarding XOR student engineering club membership, virtual ID cards, workshops, and lead access at LAEC Bidar.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
