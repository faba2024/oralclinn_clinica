"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "fade" | "scale";

interface RevealProps {
  children: ReactNode;
  as?: "div" | "li" | "section" | "span" | "figure" | "article";
  variant?: Variant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/** Revela o conteúdo com uma transição suave quando ele entra na tela. */
export function Reveal({ children, as = "div", variant = "up", delay = 0, className, style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className,
      "data-reveal": variant === "up" ? "" : variant,
      "data-shown": shown ? "true" : "false",
      style: { ...style, ["--reveal-delay" as string]: `${delay}ms` },
    },
    children,
  );
}

/** Número que conta até o valor final quando aparece na tela. Mantém prefixos/sufixos (ex.: "+15", "100%"). */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const target = match ? Number(match[2].replace(",", ".")) : 0;
  const decimals = match && /[.,]/.test(match[2]) ? match[2].split(/[.,]/)[1].length : 0;
  const [current, setCurrent] = useState(match ? 0 : target);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurrent(target);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const duration = 1600;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 4);
        setCurrent(target * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match) return <span className={className}>{value}</span>;
  const formatted = current.toFixed(decimals).replace(".", ",");
  return (
    <span ref={ref} className={className}>
      {match[1]}
      {formatted}
      {match[3]}
    </span>
  );
}
