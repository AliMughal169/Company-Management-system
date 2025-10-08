import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// todo: remove mock functionality
interface SalaryRecord {
  id: string;
  employeeName: string;
  designation: string;
  month: string;
  baseSalary: string;
  bonuses: string;
  deductions: string;
  netPay: string;
  status: "paid" | "pending";
}

const mockSalaryRecords: SalaryRecord[] = [
  { id: "1", employeeName: "John Doe", designation: "Sales Manager", month: "February 2024", baseSalary: "$5,000", bonuses: "$500", deductions: "$200", netPay: "$5,300", status: "paid" },
  { id: "2", employeeName: "Jane Smith", designation: "Marketing Director", month: "February 2024", baseSalary: "$6,500", bonuses: "$800", deductions: "$250", netPay: "$7,050", status: "paid" },
  { id: "3", employeeName: "Mike Johnson", designation: "Tech Lead", month: "February 2024", baseSalary: "$7,000", bonuses: "$1,000", deductions: "$300", netPay: "$7,700", status: "pending" },
  { id: "4", employeeName: "Sarah Williams", designation: "HR Manager", month: "February 2024", baseSalary: "$5,500", bonuses: "$600", deductions: "$220", netPay: "$5,880", status: "paid" },
  { id: "5", employeeName: "Tom Brown", designation: "Operations Head", month: "February 2024", baseSalary: "$6,000", bonuses: "$700", deductions: "$240", netPay: "$6,460", status: "pending" },
];

export default function Salaries() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<SalaryRecord>[] = [
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
    { header: "Month", accessor: "month" },
    { header: "Base Salary", accessor: "baseSalary" },
    { header: "Bonuses", accessor: "bonuses", className: "text-chart-2" },
    { header: "Deductions", accessor: "deductions", className: "text-destructive" },
    { header: "Net Pay", accessor: "netPay", className: "font-bold" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting salaries as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting salaries as PDF");
  };

  const handleRowClick = (salary: SalaryRecord) => {
    console.log("Opening salary record:", salary.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Salaries</h1>
          <p className="text-muted-foreground mt-1">
            Manage salary payments and payroll
          </p>
        </div>
        <Button data-testid="button-process-payroll">
          <DollarSign className="h-4 w-4 mr-2" />
          Process Payroll
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search salary records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-salaries"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockSalaryRecords}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
