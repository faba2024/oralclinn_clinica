"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { toast } from "@/stores/toast-store";
import { cn } from "@/utils/cn";
import { recordService } from "../service";
import { LOWER_TEETH, TOOTH_STATES, UPPER_TEETH, type ToothRecord, type ToothState } from "../types";

function toothKind(n: number): "molar" | "premolar" | "canine" | "incisor" {
  const d = n % 10;
  if (d >= 6) return "molar";
  if (d >= 4) return "premolar";
  if (d === 3) return "canine";
  return "incisor";
}

interface ToothProps {
  number: number;
  record?: ToothRecord;
  upper: boolean;
  selected: boolean;
  onClick: () => void;
}

/** Dente estilizado em SVG: coroa colorida pelo estado e raízes em traço fino. */
function Tooth({ number, record, upper, selected, onClick }: ToothProps) {
  const kind = toothKind(number);
  const state = record?.state ?? "saudavel";
  const style = TOOTH_STATES[state];
  const width = kind === "molar" ? 34 : kind === "premolar" ? 28 : 24;
  const roots =
    kind === "molar"
      ? [`M${6} 26 C 5 16, 7 8, 9 3`, `M${width - 6} 26 C ${width - 5} 16, ${width - 7} 8, ${width - 9} 3`]
      : kind === "premolar"
        ? [`M${width / 2 - 3} 26 C ${width / 2 - 4} 14, ${width / 2 - 2} 7, ${width / 2} 2`, `M${width / 2 + 3} 26 C ${width / 2 + 4} 14, ${width / 2 + 2} 7, ${width / 2} 2`]
        : [`M${width / 2 - 4} 26 C ${width / 2 - 3} 14, ${width / 2 - 1} 6, ${width / 2} 1 C ${width / 2 + 1} 6, ${width / 2 + 3} 14, ${width / 2 + 4} 26`];
  const crownPath =
    kind === "molar"
      ? `M2 28 Q2 26 6 26 L${width - 6} 26 Q${width - 2} 26 ${width - 2} 30 L${width - 2} 46 Q${width - 2} 54 ${width / 2} 54 Q2 54 2 46 Z`
      : kind === "incisor"
        ? `M3 27 Q3 26 6 26 L${width - 6} 26 Q${width - 3} 26 ${width - 3} 29 L${width - 4} 48 Q${width / 2} 56 4 48 Z`
        : `M2 28 Q2 26 6 26 L${width - 6} 26 Q${width - 2} 26 ${width - 2} 30 L${width - 3} 45 Q${width / 2} 57 3 45 Z`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Dente ${number}: ${style.label}${record?.note ? ` — ${record.note}` : ""}`}
      className={cn(
        "group flex flex-col items-center gap-1 rounded-[10px] px-0.5 py-1.5 transition-colors duration-150",
        selected ? "bg-gold-soft ring-1 ring-gold" : "hover:bg-sand",
        !upper && "flex-col-reverse",
      )}
    >
      <span className={cn("text-[10.5px] font-semibold tabular", selected ? "text-gold-dark" : "text-subtle")}>{number}</span>
      <svg width={width} height={58} viewBox={`0 0 ${width} 58`} className={cn(!upper && "rotate-180")} aria-hidden>
        {state === "implante" ? (
          <g stroke={style.stroke} strokeWidth="1.2">
            <rect x={width / 2 - 3} y={3} width={6} height={23} rx={1.5} fill="#f1ede5" />
            {[7, 12, 17, 22].map((y) => (
              <line key={y} x1={width / 2 - 5} x2={width / 2 + 5} y1={y} y2={y} />
            ))}
          </g>
        ) : (
          roots.map((d, i) => <path key={i} d={d} fill="none" stroke={state === "ausente" ? "#d9d4ca" : "#cfc7b6"} strokeWidth="1.3" strokeDasharray={state === "ausente" ? "2 2" : undefined} />)
        )}
        <path
          d={crownPath}
          fill={state === "ausente" ? "transparent" : style.fill}
          stroke={style.stroke}
          strokeWidth={selected ? 1.8 : 1.3}
          strokeDasharray={state === "ausente" ? "3 2" : undefined}
        />
        {state === "ausente" ? <path d={`M6 32 L${width - 6} 50 M${width - 6} 32 L6 50`} stroke={style.stroke} strokeWidth="1.2" /> : null}
        {state === "carie" ? <circle cx={width / 2} cy={40} r={3.2} fill={style.stroke} opacity={0.85} /> : null}
        {state === "restauracao" ? <rect x={width / 2 - 5} y={35} width={10} height={7} rx={2} fill={style.stroke} opacity={0.75} /> : null}
        {state === "coroa" ? <path d={crownPath} fill="none" stroke={style.stroke} strokeWidth="3" opacity={0.35} /> : null}
        {state === "planejado" ? <circle cx={width / 2} cy={40} r={4} fill="none" stroke={style.stroke} strokeWidth="1.5" strokeDasharray="2 1.5" /> : null}
        {state === "concluido" ? <path d={`M${width / 2 - 4.5} 40 l3 3 l6 -6.5`} fill="none" stroke={style.stroke} strokeWidth="1.8" strokeLinecap="round" /> : null}
        {record?.note ? <circle cx={width - 4} cy={30} r={2.2} fill="#B69A67" /> : null}
      </svg>
    </button>
  );
}

interface OdontogramProps {
  patientId: string;
  odontogram: Record<string, ToothRecord>;
  readOnly?: boolean;
}

export function Odontogram({ patientId, odontogram, readOnly }: OdontogramProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const current = selected ? odontogram[String(selected)] : undefined;

  const select = (n: number) => {
    setSelected((s) => (s === n ? null : n));
    setNote(odontogram[String(n)]?.note ?? "");
  };

  const apply = async (state: ToothState) => {
    if (!selected) return;
    await recordService.setTooth(patientId, String(selected), { state, note: note.trim() || undefined });
    toast.success(`Dente ${selected} atualizado`, TOOTH_STATES[state].label);
  };

  const summary = Object.entries(odontogram).reduce<Record<string, number>>((acc, [, r]) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <div className="min-w-0">
        <div className="scrollbar-thin overflow-x-auto rounded-[12px] border border-line bg-ivory/60 p-3">
          <div className="mx-auto w-max">
            <p className="mb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-subtle">Arcada superior</p>
            <div className="flex items-end justify-center gap-0.5">
              {UPPER_TEETH.map((n, i) => (
                <div key={n} className={cn(i === 8 && "ml-3 border-l border-dashed border-line-strong pl-3")}>
                  <Tooth number={n} record={odontogram[String(n)]} upper selected={selected === n} onClick={() => select(n)} />
                </div>
              ))}
            </div>
            <div className="my-2 h-px bg-line-strong/70" />
            <div className="flex items-start justify-center gap-0.5">
              {LOWER_TEETH.map((n, i) => (
                <div key={n} className={cn(i === 8 && "ml-3 border-l border-dashed border-line-strong pl-3")}>
                  <Tooth number={n} record={odontogram[String(n)]} upper={false} selected={selected === n} onClick={() => select(n)} />
                </div>
              ))}
            </div>
            <p className="mt-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.16em] text-subtle">Arcada inferior</p>
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legenda do odontograma">
          {(Object.keys(TOOTH_STATES) as ToothState[]).map((s) => (
            <li key={s} className="flex items-center gap-1.5 text-[12px] text-muted">
              <span className="size-3 rounded-[4px] border" style={{ backgroundColor: TOOTH_STATES[s].fill, borderColor: TOOTH_STATES[s].stroke }} />
              {TOOTH_STATES[s].label}
              {summary[s] ? <span className="font-semibold tabular text-ink">{summary[s]}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-[12px] border border-line bg-white p-4" aria-live="polite">
        {selected ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">Dente selecionado</p>
            <p className="mt-1 text-2xl font-semibold tabular">{selected}</p>
            <p className="text-[13px] text-muted">{TOOTH_STATES[current?.state ?? "saudavel"].label}</p>
            {!readOnly ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  {(Object.keys(TOOTH_STATES) as ToothState[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => apply(s)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11.5px] font-medium transition-colors",
                        (current?.state ?? "saudavel") === s ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:border-line-strong",
                      )}
                    >
                      <span className="size-2.5 shrink-0 rounded-[3px] border" style={{ backgroundColor: TOOTH_STATES[s].fill, borderColor: TOOTH_STATES[s].stroke }} />
                      <span className="truncate">{TOOTH_STATES[s].label}</span>
                    </button>
                  ))}
                </div>
                <Field label="Anotação do dente" htmlFor="tooth-note" className="mt-4">
                  <Textarea id="tooth-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: faceta em resina realizada" />
                </Field>
                <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => apply(current?.state ?? "saudavel")}>
                  Salvar anotação
                </Button>
              </>
            ) : current?.note ? (
              <p className="mt-3 text-[13px] text-ink-2">{current.note}</p>
            ) : null}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-[13px] font-medium text-ink">Selecione um dente</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">Clique no odontograma para registrar o estado e anotações do elemento.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
