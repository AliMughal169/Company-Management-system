import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joinDate: string;
  status: "active" | "inactive";
}

const mockEmployees: Employee[] = [
  { id: "1", name: "John Doe", email: "john.doe@company.com", department: "Sales", designation: "Sales Manager", joinDate: "2020-03-15", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane.smith@company.com", department: "Marketing", designation: "Marketing Director", joinDate: "2019-07-22", status: "active" },
  { id: "3", name: "Mike Johnson", email: "mike.j@company.com", department: "IT", designation: "Tech Lead", joinDate: "2021-01-10", status: "active" },
  { id: "4", name: "Sarah Williams", email: "sarah.w@company.com", department: "HR", designation: "HR Manager", joinDate: "2018-11-05", status: "active" },
  { id: "5", name: "Tom Brown", email: "tom.b@company.com", department: "Operations", designation: "Operations Head", joinDate: "2022-05-18", status: "inactive" },
];

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<Employee>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {row.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Department",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal">
          {row.department}
        </Badge>
      ),
    },
    { header: "Designation", accessor: "designation" },
    { header: "Join Date", accessor: "joinDate" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting employees as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting employees as PDF");
  };

  const handleRowClick = (employee: Employee) => {
    console.log("Opening employee:", employee.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee information and records
          </p>
        </div>
        <Button data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-employees"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockEmployees}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
