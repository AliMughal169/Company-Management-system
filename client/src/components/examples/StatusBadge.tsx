import { StatusBadge } from "../status-badge";

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 p-4 flex-wrap">
      <StatusBadge status="paid" />
      <StatusBadge status="pending" />
      <StatusBadge status="overdue" />
      <StatusBadge status="approved" />
      <StatusBadge status="rejected" />
      <StatusBadge status="draft" />
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
      <StatusBadge status="low" />
      <StatusBadge status="in-stock" />
      <StatusBadge status="out-of-stock" />
    </div>
  );
}
