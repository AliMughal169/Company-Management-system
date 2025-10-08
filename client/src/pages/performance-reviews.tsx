import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// todo: remove mock functionality
interface PerformanceReview {
  id: string;
  employeeName: string;
  reviewPeriod: string;
  reviewer: string;
  overallRating: number;
  completionDate: string;
  status: string;
}

const mockReviews: PerformanceReview[] = [
  { id: "1", employeeName: "John Doe", reviewPeriod: "Q4 2023", reviewer: "Sarah Williams", overallRating: 4.5, completionDate: "2024-01-15", status: "Completed" },
  { id: "2", employeeName: "Jane Smith", reviewPeriod: "Q4 2023", reviewer: "Tom Brown", overallRating: 4.8, completionDate: "2024-01-18", status: "Completed" },
  { id: "3", employeeName: "Mike Johnson", reviewPeriod: "Q1 2024", reviewer: "Sarah Williams", overallRating: 0, completionDate: "-", status: "In Progress" },
  { id: "4", employeeName: "Tom Brown", reviewPeriod: "Q4 2023", reviewer: "Jane Smith", overallRating: 4.2, completionDate: "2024-01-20", status: "Completed" },
];

export default function PerformanceReviews() {
  const [searchQuery, setSearchQuery] = useState("");

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-chart-4 text-chart-4"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string, id: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      "In Progress": "bg-chart-4/20 text-chart-4 border-chart-4/30",
      Pending: "bg-muted/50 text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[status]} data-testid={`badge-review-status-${id}`}>
        {status}
      </Badge>
    );
  };

  const columns: Column<PerformanceReview>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {row.employeeName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.employeeName}</span>
        </div>
      ),
    },
    { header: "Review Period", accessor: "reviewPeriod" },
    { header: "Reviewer", accessor: "reviewer" },
    {
      header: "Rating",
      accessor: (row) => row.overallRating > 0 ? getRatingStars(row.overallRating) : <span className="text-muted-foreground">-</span>,
    },
    { header: "Completion Date", accessor: "completionDate" },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status, row.id),
    },
  ];

  const handleRowClick = (review: PerformanceReview) => {
    console.log("Opening review:", review.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Track employee performance and feedback
          </p>
        </div>
        <Button data-testid="button-create-review">
          <Plus className="h-4 w-4 mr-2" />
          Create Review
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-card border border-card-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <Star className="h-4 w-4 text-chart-4" />
          </div>
          <div className="text-3xl font-bold" data-testid="text-average-rating">4.5</div>
          <Progress value={90} className="h-2 mt-2" />
        </div>
        <div className="bg-card border border-card-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Completed</p>
          <div className="text-3xl font-bold text-chart-2" data-testid="text-completed-reviews">24</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">In Progress</p>
          <div className="text-3xl font-bold text-chart-4" data-testid="text-inprogress-reviews">8</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <div className="text-3xl font-bold text-muted-foreground" data-testid="text-pending-reviews">16</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-reviews"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-period">
          Filter by Period
        </Button>
      </div>

      <DataTable
        data={mockReviews}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
