"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";

const palette = ["#B69A67", "#8C7A5B", "#6E8B74", "#4F6A80", "#9A6B5B", "#7A6F8E", "#5E7F86"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}

const sizes = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
  xl: "size-[72px] text-xl",
};

export function Avatar({ name, src, size = "md", color, className }: AvatarProps) {
  const tint = color ?? colorFor(name);
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold tracking-wide", sizes[size], className)}
      style={showImage ? undefined : { backgroundColor: `${tint}1f`, color: tint, boxShadow: `inset 0 0 0 1px ${tint}33` }}
      aria-hidden={!showImage}
    >
      {showImage ? <Image src={src!} alt={name} fill sizes="72px" className="object-cover" unoptimized={src!.startsWith("data:")} onError={() => setFailed(true)} /> : initials(name)}
    </span>
  );
}
