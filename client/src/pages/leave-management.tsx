import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// todo: remove mock functionality
interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "approved" | "pending" | "rejected";
}

const mockLeaveRequests: LeaveRequest[] = [
  { id: "1", employeeName: "John Doe", leaveType: "Vacation", startDate: "2024-03-01", endDate: "2024-03-05", days: 5, reason: "Family trip", status: "approved" },
  { id: "2", employeeName: "Jane Smith", leaveType: "Sick Leave", startDate: "2024-02-20", endDate: "2024-02-21", days: 2, reason: "Medical appointment", status: "approved" },
  { id: "3", employeeName: "Mike Johnson", leaveType: "Vacation", startDate: "2024-03-10", endDate: "2024-03-15", days: 6, reason: "Personal", status: "pending" },
  { id: "4", employeeName: "Sarah Williams", leaveType: "Personal", startDate: "2024-02-25", endDate: "2024-02-25", days: 1, reason: "Family emergency", status: "rejected" },
];

const leaveBalances = [
  { type: "Vacation", used: 8, total: 20 },
  { type: "Sick Leave", used: 3, total: 10 },
  { type: "Personal", used: 2, total: 5 },
];

export default function LeaveManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<LeaveRequest>[] = [
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
    {
      header: "Leave Type",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal" data-testid={`badge-leave-type-${row.id}`}>
          {row.leaveType}
        </Badge>
      ),
    },
    { header: "Start Date", accessor: "startDate" },
    { header: "End Date", accessor: "endDate" },
    { header: "Days", accessor: "days", className: "font-semibold" },
    { header: "Reason", accessor: "reason" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleRowClick = (leave: LeaveRequest) => {
    console.log("Opening leave request:", leave.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee leave requests and balances
          </p>
        </div>
        <Button data-testid="button-request-leave">
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {leaveBalances.map((balance, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{balance.type}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" data-testid={`text-${balance.type.toLowerCase().replace(/\s+/g, '-')}-remaining`}>
                  {balance.total - balance.used}
                </span>
                <span className="text-sm text-muted-foreground">/ {balance.total} days</span>
              </div>
              <Progress 
                value={(balance.used / balance.total) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground" data-testid={`text-${balance.type.toLowerCase().replace(/\s+/g, '-')}-used`}>
                {balance.used} days used
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leave requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-leaves"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-status">
          Filter by Status
        </Button>
      </div>

      <DataTable
        data={mockLeaveRequests}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
