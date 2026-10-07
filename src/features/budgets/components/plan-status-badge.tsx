import { Badge } from "@/components/ui/badge";
import { PLAN_STATUS, type PlanStatus } from "../types";

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <Badge tone={PLAN_STATUS[status].tone} dot>
      {PLAN_STATUS[status].label}
    </Badge>
  );
}
