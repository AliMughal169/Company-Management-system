import { StatsCard } from "../stats-card";
import { DollarSign } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-4 w-80">
      <StatsCard
        title="Total Revenue"
        value="$328,000"
        trend={{ value: "+12.5%", isPositive: true }}
        icon={DollarSign}
        iconColor="text-chart-2"
      />
    </div>
  );
}
