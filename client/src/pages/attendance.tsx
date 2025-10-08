import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// todo: remove mock functionality
interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  overtime: string;
  status: string;
}

const mockAttendance: AttendanceRecord[] = [
  { id: "1", employeeName: "John Doe", date: "2024-02-10", checkIn: "09:00 AM", checkOut: "06:15 PM", workHours: "9.25", overtime: "1.25", status: "Present" },
  { id: "2", employeeName: "Jane Smith", date: "2024-02-10", checkIn: "08:45 AM", checkOut: "05:30 PM", workHours: "8.75", overtime: "0.75", status: "Present" },
  { id: "3", employeeName: "Mike Johnson", date: "2024-02-10", checkIn: "09:30 AM", checkOut: "06:00 PM", workHours: "8.5", overtime: "0.5", status: "Late" },
  { id: "4", employeeName: "Sarah Williams", date: "2024-02-10", checkIn: "-", checkOut: "-", workHours: "0", overtime: "0", status: "Absent" },
  { id: "5", employeeName: "Tom Brown", date: "2024-02-10", checkIn: "09:00 AM", checkOut: "05:00 PM", workHours: "8", overtime: "0", status: "Present" },
];

const attendanceStats = [
  { label: "Present Today", value: "42", color: "text-chart-2" },
  { label: "Late Arrivals", value: "3", color: "text-chart-4" },
  { label: "Absent", value: "3", color: "text-destructive" },
  { label: "Avg Work Hours", value: "8.5", color: "text-primary" },
];

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string, id: string) => {
    const colors: Record<string, string> = {
      Present: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      Late: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      Absent: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return (
      <Badge variant="outline" className={colors[status]} data-testid={`badge-attendance-status-${id}`}>
        {status}
      </Badge>
    );
  };

  const columns: Column<AttendanceRecord>[] = [
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
    { header: "Date", accessor: "date" },
    { header: "Check In", accessor: "checkIn", className: "font-mono text-sm" },
    { header: "Check Out", accessor: "checkOut", className: "font-mono text-sm" },
    { header: "Work Hours", accessor: "workHours", className: "font-semibold" },
    { header: "Overtime", accessor: "overtime", className: "text-chart-2" },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status, row.id),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor employee attendance and work hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-attendance">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button data-testid="button-mark-attendance">
            <Clock className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {attendanceStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
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
            placeholder="Search attendance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-attendance"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-date">
          <Calendar className="h-4 w-4 mr-2" />
          Select Date
        </Button>
      </div>

      <DataTable
        data={mockAttendance}
        columns={columns}
        currentPage={1}
        totalPages={5}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
