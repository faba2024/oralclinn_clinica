import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Oralclin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
