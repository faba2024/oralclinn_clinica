import type { Metadata } from "next";
import { WhatsappView } from "@/features/whatsapp/components/whatsapp-view";

export const metadata: Metadata = { title: "WhatsApp" };

export default function WhatsappPage() {
  return <WhatsappView />;
}
