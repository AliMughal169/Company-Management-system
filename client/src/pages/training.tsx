import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Award, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// todo: remove mock functionality
interface TrainingRecord {
  id: string;
  employeeName: string;
  courseName: string;
  category: string;
  startDate: string;
  completionDate: string;
  progress: number;
  status: string;
}

const mockTraining: TrainingRecord[] = [
  { id: "1", employeeName: "John Doe", courseName: "Advanced Sales Techniques", category: "Sales", startDate: "2024-01-15", completionDate: "2024-02-15", progress: 100, status: "Completed" },
  { id: "2", employeeName: "Jane Smith", courseName: "Digital Marketing Mastery", category: "Marketing", startDate: "2024-02-01", completionDate: "-", progress: 65, status: "In Progress" },
  { id: "3", employeeName: "Mike Johnson", courseName: "Cloud Architecture", category: "Technical", startDate: "2024-01-20", completionDate: "2024-03-01", progress: 85, status: "In Progress" },
  { id: "4", employeeName: "Sarah Williams", courseName: "Leadership Development", category: "Management", startDate: "2024-01-10", completionDate: "2024-02-10", progress: 100, status: "Completed" },
];

const trainingStats = [
  { label: "Total Courses", value: "32", icon: BookOpen, color: "text-chart-1" },
  { label: "Completed", value: "18", icon: Award, color: "text-chart-2" },
  { label: "In Progress", value: "12", icon: BookOpen, color: "text-chart-4" },
  { label: "Avg Completion", value: "78%", icon: Award, color: "text-chart-3" },
];

export default function Training() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string, id: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      "In Progress": "bg-chart-4/20 text-chart-4 border-chart-4/30",
      "Not Started": "bg-muted/50 text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[status]} data-testid={`badge-training-status-${id}`}>
        {status}
      </Badge>
    );
  };

  const columns: Column<TrainingRecord>[] = [
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
    { header: "Course Name", accessor: "courseName", className: "font-medium" },
    {
      header: "Category",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal" data-testid={`badge-training-category-${row.id}`}>
          {row.category}
        </Badge>
      ),
    },
    { header: "Start Date", accessor: "startDate" },
    {
      header: "Progress",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Progress value={row.progress} className="h-2 w-20" />
          <span className="text-sm font-medium">{row.progress}%</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status, row.id),
    },
  ];

  const handleRowClick = (training: TrainingRecord) => {
    console.log("Opening training record:", training.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Training & Certifications</h1>
          <p className="text-muted-foreground mt-1">
            Track employee training programs and certifications
          </p>
        </div>
        <Button data-testid="button-assign-course">
          <Plus className="h-4 w-4 mr-2" />
          Assign Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {trainingStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`} data-testid={`text-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search training records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-training"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-category">
          Filter by Category
        </Button>
      </div>

      <DataTable
        data={mockTraining}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
