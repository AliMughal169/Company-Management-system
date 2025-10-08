import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// todo: remove mock functionality
interface ExitRecord {
  id: string;
  employeeName: string;
  designation: string;
  resignationDate: string;
  lastWorkingDay: string;
  clearanceStatus: number;
  finalSettlement: string;
  status: string;
}

const mockExitRecords: ExitRecord[] = [
  { id: "1", employeeName: "Alex Green", designation: "Sales Executive", resignationDate: "2024-02-01", lastWorkingDay: "2024-03-01", clearanceStatus: 100, finalSettlement: "$8,500", status: "Completed" },
  { id: "2", employeeName: "Lisa Brown", designation: "Marketing Coordinator", resignationDate: "2024-02-10", lastWorkingDay: "2024-03-10", clearanceStatus: 75, finalSettlement: "$6,200", status: "In Progress" },
  { id: "3", employeeName: "David Wilson", designation: "Junior Developer", resignationDate: "2024-02-15", lastWorkingDay: "2024-03-15", clearanceStatus: 40, finalSettlement: "$5,800", status: "In Progress" },
];

const clearanceChecklist = [
  { item: "IT Equipment Return", completed: true },
  { item: "Access Card Return", completed: true },
  { item: "Exit Interview", completed: true },
  { item: "Knowledge Transfer", completed: false },
  { item: "Final Approvals", completed: false },
];

export default function ExitManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string, id: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      "In Progress": "bg-chart-4/20 text-chart-4 border-chart-4/30",
      Pending: "bg-muted/50 text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[status]} data-testid={`badge-exit-status-${id}`}>
        {status}
      </Badge>
    );
  };

  const columns: Column<ExitRecord>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {row.employeeName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.employeeName}</p>
            <p className="text-xs text-muted-foreground">{row.designation}</p>
          </div>
        </div>
      ),
    },
    { header: "Resignation Date", accessor: "resignationDate" },
    { header: "Last Working Day", accessor: "lastWorkingDay" },
    {
      header: "Clearance",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Progress value={row.clearanceStatus} className="h-2 w-20" />
          <span className="text-sm font-medium">{row.clearanceStatus}%</span>
        </div>
      ),
    },
    { header: "Final Settlement", accessor: "finalSettlement", className: "font-semibold" },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status, row.id),
    },
  ];

  const handleRowClick = (exit: ExitRecord) => {
    console.log("Opening exit record:", exit.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exit Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee resignations and exit process
          </p>
        </div>
        <Button data-testid="button-initiate-exit">
          <Plus className="h-4 w-4 mr-2" />
          Initiate Exit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exit Process Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Exit Processes</span>
              <span className="text-2xl font-bold" data-testid="text-active-exit-processes">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed This Month</span>
              <span className="text-2xl font-bold text-chart-2" data-testid="text-completed-exits">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Settlement Time</span>
              <span className="text-2xl font-bold text-chart-4" data-testid="text-avg-settlement-time">12 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clearance Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clearanceChecklist.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-chart-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={item.completed ? "text-sm" : "text-sm text-muted-foreground"}>
                      {item.item}
                    </span>
                  </div>
                  {item.completed && (
                    <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2/30 text-xs">
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exit records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-exits"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-status">
          Filter by Status
        </Button>
      </div>

      <DataTable
        data={mockExitRecords}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={1}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
