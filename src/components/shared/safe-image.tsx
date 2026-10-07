"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { IMAGES, resolveImagePath } from "@/data/images";

type FallbackKind = keyof typeof IMAGES.fallback;

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallback?: FallbackKind;
}

/**
 * next/image com fallback global: imagem ausente ou com erro nunca exibe o
 * ícone quebrado do navegador — mostra a imagem reserva da marca.
 * Fotografias são servidas em alta qualidade (92) e no tamanho certo para
 * cada tela, incluindo telas retina. Data URLs (uploads) são exibidos sem otimização.
 */
export function SafeImage({ src, fallback = "treatment", alt, ...props }: SafeImageProps) {
  const fallbackSrc = IMAGES.fallback[fallback];
  const initial = src ? resolveImagePath(src) : fallbackSrc;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    setCurrent(initial);
  }, [initial]);

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      quality={props.quality ?? 92}
      unoptimized={current.startsWith("data:") || props.unoptimized}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
