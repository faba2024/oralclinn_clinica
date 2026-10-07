import { formatPercent } from "@/utils/format";

/** Funil de conversão em barras proporcionais — leitura mais clara que um gráfico 3D. */
export function Funnel({ steps }: { steps: { stage: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="space-y-2.5">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? step.value / prev : null;
        return (
          <li key={step.stage}>
            <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
              <span className="text-muted">{step.stage}</span>
              <span className="flex items-baseline gap-2">
                {rate !== null ? <span className="text-[11px] text-subtle">{formatPercent(rate)}</span> : null}
                <span className="font-semibold tabular text-ink">{step.value}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${(step.value / max) * 100}%`, backgroundColor: i === steps.length - 1 ? "#B69A67" : `rgba(32,32,32,${0.85 - i * 0.14})` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
