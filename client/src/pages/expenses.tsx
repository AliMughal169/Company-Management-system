import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
interface Expense {
  id: string;
  description: string;
  category: string;
  amount: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  submittedBy: string;
}

const mockExpenses: Expense[] = [
  { id: "1", description: "Office Supplies", category: "Operations", amount: "$450", date: "2024-02-01", status: "approved", submittedBy: "John Doe" },
  { id: "2", description: "Marketing Campaign", category: "Marketing", amount: "$2,500", date: "2024-02-03", status: "pending", submittedBy: "Jane Smith" },
  { id: "3", description: "Software Licenses", category: "IT", amount: "$1,200", date: "2024-02-05", status: "approved", submittedBy: "Mike Johnson" },
  { id: "4", description: "Team Building Event", category: "HR", amount: "$800", date: "2024-02-07", status: "rejected", submittedBy: "Sarah Williams" },
  { id: "5", description: "Travel Expenses", category: "Operations", amount: "$650", date: "2024-02-08", status: "pending", submittedBy: "Tom Brown" },
];

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<Expense>[] = [
    { header: "Description", accessor: "description", className: "font-medium" },
    {
      header: "Category",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal">
          {row.category}
        </Badge>
      ),
    },
    { header: "Amount", accessor: "amount", className: "font-semibold" },
    { header: "Date", accessor: "date" },
    { header: "Submitted By", accessor: "submittedBy" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting expenses as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting expenses as PDF");
  };

  const handleRowClick = (expense: Expense) => {
    console.log("Opening expense:", expense.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage company expenses
          </p>
        </div>
        <Button data-testid="button-add-expense">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-expenses"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockExpenses}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
