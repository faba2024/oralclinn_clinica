"use client";

import { WhatsappIcon } from "@/components/shared/social-icons";
import { useSiteContent } from "@/features/site/hooks";
import { whatsappLink } from "@/utils/whatsapp";

export function WhatsappFloat() {
  const content = useSiteContent();
  return (
    <a
      href={whatsappLink(content.whatsapp, "Olá! Vim pelo site e gostaria de agendar uma avaliação.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#1f8f4e] text-white shadow-[0_10px_30px_-8px_rgba(31,143,78,0.6)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105"
    >
      <WhatsappIcon className="size-7" />
    </a>
  );
}
