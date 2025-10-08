import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// todo: remove mock functionality
interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: "1", timestamp: "2024-02-10 14:23:45", user: "John Doe", action: "Created", module: "Invoice", details: "Invoice #INV-2024-001 created" },
  { id: "2", timestamp: "2024-02-10 14:15:22", user: "Jane Smith", action: "Updated", module: "Customer", details: "Customer 'Acme Corp' details updated" },
  { id: "3", timestamp: "2024-02-10 13:45:10", user: "Mike Johnson", action: "Deleted", module: "Expense", details: "Expense #EXP-125 deleted" },
  { id: "4", timestamp: "2024-02-10 12:30:18", user: "Sarah Williams", action: "Approved", module: "Proforma", details: "Proforma #PRO-2024-004 approved" },
  { id: "5", timestamp: "2024-02-10 11:20:33", user: "Tom Brown", action: "Created", module: "Employee", details: "Employee 'Alex Green' added" },
  { id: "6", timestamp: "2024-02-10 10:15:55", user: "John Doe", action: "Updated", module: "Stock", details: "Stock item PRD-003 quantity updated" },
  { id: "7", timestamp: "2024-02-10 09:45:12", user: "Jane Smith", action: "Processed", module: "Salary", details: "Payroll for February 2024 processed" },
];

const actionColors: Record<string, string> = {
  Created: "bg-chart-2/20 text-chart-2",
  Updated: "bg-chart-1/20 text-chart-1",
  Deleted: "bg-destructive/20 text-destructive",
  Approved: "bg-chart-2/20 text-chart-2",
  Processed: "bg-chart-3/20 text-chart-3",
};

export default function AuditReports() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<AuditLog>[] = [
    { header: "Timestamp", accessor: "timestamp", className: "font-mono text-sm" },
    { header: "User", accessor: "user", className: "font-medium" },
    {
      header: "Action",
      accessor: (row) => (
        <Badge variant="outline" className={actionColors[row.action] || ""}>
          {row.action}
        </Badge>
      ),
    },
    {
      header: "Module",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal">
          {row.module}
        </Badge>
      ),
    },
    { header: "Details", accessor: "details" },
  ];

  const handleExportCSV = () => {
    console.log("Exporting audit logs as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting audit logs as PDF");
  };

  const handleGenerateReport = () => {
    console.log("Generating comprehensive audit report");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Audit Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and changes
          </p>
        </div>
        <Button onClick={handleGenerateReport} data-testid="button-generate-report">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">In the last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Module</CardTitle>
            <Badge variant="secondary">Invoice</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground mt-1">Activities this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-audit"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-date">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockAuditLogs}
        columns={columns}
        currentPage={1}
        totalPages={4}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
