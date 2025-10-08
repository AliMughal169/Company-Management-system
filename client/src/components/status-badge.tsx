import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "paid" | "pending" | "overdue" | "approved" | "rejected" | "draft" | "active" | "inactive" | "low" | "in-stock" | "out-of-stock";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<StatusBadgeProps["status"], { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
    pending: { label: "Pending", className: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
    overdue: { label: "Overdue", className: "bg-destructive/20 text-destructive border-destructive/30" },
    approved: { label: "Approved", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
    rejected: { label: "Rejected", className: "bg-destructive/20 text-destructive border-destructive/30" },
    draft: { label: "Draft", className: "bg-muted/50 text-muted-foreground border-border" },
    active: { label: "Active", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
    inactive: { label: "Inactive", className: "bg-muted/50 text-muted-foreground border-border" },
    low: { label: "Low Stock", className: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
    "in-stock": { label: "In Stock", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
    "out-of-stock": { label: "Out of Stock", className: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  const { label, className: variantClass } = variants[status];

  return (
    <Badge variant="outline" className={`${variantClass} ${className || ""}`} data-testid={`badge-${status}`}>
      {label}
    </Badge>
  );
}
