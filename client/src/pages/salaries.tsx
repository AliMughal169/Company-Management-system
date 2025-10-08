import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Search, FileText, Download } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// todo: remove mock functionality
interface SalaryRecord {
  id: string;
  employeeName: string;
  designation: string;
  month: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  healthInsurance: number;
  taxDeduction: number;
  otherDeductions: number;
  netPay: number;
  status: "paid" | "pending";
}

const mockSalaryRecords: SalaryRecord[] = [
  { id: "1", employeeName: "John Doe", designation: "Sales Manager", month: "February 2024", baseSalary: 5000, housingAllowance: 800, transportAllowance: 300, healthInsurance: 150, taxDeduction: 750, otherDeductions: 50, netPay: 5150, status: "paid" },
  { id: "2", employeeName: "Jane Smith", designation: "Marketing Director", month: "February 2024", baseSalary: 6500, housingAllowance: 1000, transportAllowance: 400, healthInsurance: 200, taxDeduction: 975, otherDeductions: 75, netPay: 6650, status: "paid" },
  { id: "3", employeeName: "Mike Johnson", designation: "Tech Lead", month: "February 2024", baseSalary: 7000, housingAllowance: 1200, transportAllowance: 500, healthInsurance: 250, taxDeduction: 1050, otherDeductions: 100, netPay: 7300, status: "pending" },
  { id: "4", employeeName: "Sarah Williams", designation: "HR Manager", month: "February 2024", baseSalary: 5500, housingAllowance: 900, transportAllowance: 350, healthInsurance: 175, taxDeduction: 825, otherDeductions: 60, netPay: 5890, status: "paid" },
];

function SalaryBreakdownDialog({ salary }: { salary: SalaryRecord }) {
  const grossPay = salary.baseSalary + salary.housingAllowance + salary.transportAllowance;
  const totalDeductions = salary.healthInsurance + salary.taxDeduction + salary.otherDeductions;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          data-testid={`button-view-breakdown-${salary.id}`}
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Salary Breakdown - {salary.month}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary">
                {salary.employeeName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{salary.employeeName}</p>
              <p className="text-sm text-muted-foreground">{salary.designation}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Earnings</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Base Salary</span>
                  <span className="font-semibold">${salary.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Housing Allowance</span>
                  <span className="font-semibold">${salary.housingAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transport Allowance</span>
                  <span className="font-semibold">${salary.transportAllowance.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Gross Pay</span>
                  <span className="font-bold text-chart-2">${grossPay.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Deductions</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Health Insurance</span>
                  <span className="font-semibold text-destructive">-${salary.healthInsurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax Deduction</span>
                  <span className="font-semibold text-destructive">-${salary.taxDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Deductions</span>
                  <span className="font-semibold text-destructive">-${salary.otherDeductions.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Deductions</span>
                  <span className="font-bold text-destructive">-${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Pay</span>
                <span className="text-2xl font-bold text-primary">${salary.netPay.toLocaleString()}</span>
              </div>
            </div>

            <Button className="w-full" data-testid={`button-download-payslip-${salary.id}`}>
              <Download className="h-4 w-4 mr-2" />
              Download Payslip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
    { 
      header: "Base Salary", 
      accessor: (row) => `$${row.baseSalary.toLocaleString()}`,
    },
    { 
      header: "Allowances", 
      accessor: (row) => `$${(row.housingAllowance + row.transportAllowance).toLocaleString()}`,
      className: "text-chart-2"
    },
    { 
      header: "Deductions", 
      accessor: (row) => `$${(row.healthInsurance + row.taxDeduction + row.otherDeductions).toLocaleString()}`,
      className: "text-destructive"
    },
    { 
      header: "Net Pay", 
      accessor: (row) => `$${row.netPay.toLocaleString()}`,
      className: "font-bold"
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "",
      accessor: (row) => <SalaryBreakdownDialog salary={row} />,
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

  const totalPayroll = mockSalaryRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalAllowances = mockSalaryRecords.reduce((sum, record) => sum + record.housingAllowance + record.transportAllowance, 0);
  const totalDeductions = mockSalaryRecords.reduce((sum, record) => sum + record.healthInsurance + record.taxDeduction + record.otherDeductions, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Salaries & Payroll</h1>
          <p className="text-muted-foreground mt-1">
            Manage salary payments with detailed breakdowns
          </p>
        </div>
        <Button data-testid="button-process-payroll">
          <DollarSign className="h-4 w-4 mr-2" />
          Process Payroll
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Allowances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">${totalAllowances.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Housing + Transport</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">${totalDeductions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Tax + Insurance + Other</p>
          </CardContent>
        </Card>
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
