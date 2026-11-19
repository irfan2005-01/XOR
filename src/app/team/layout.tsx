import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Department Leadership & Team — XOR",
  description:
    "Faculty leadership, academic advisory, and technical guidance behind XOR at Lingaraj Appa Engineering College, Bidar.",
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
