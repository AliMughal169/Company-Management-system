import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

// todo: remove mock functionality
interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2024-001", customer: "Acme Corp", amount: "$12,500", date: "2024-01-15", dueDate: "2024-02-15", status: "paid" },
  { id: "2", invoiceNumber: "INV-2024-002", customer: "TechStart Inc", amount: "$8,750", date: "2024-01-20", dueDate: "2024-02-20", status: "pending" },
  { id: "3", invoiceNumber: "INV-2024-003", customer: "Global Solutions", amount: "$15,200", date: "2024-01-10", dueDate: "2024-01-25", status: "overdue" },
  { id: "4", invoiceNumber: "INV-2024-004", customer: "Innovation Labs", amount: "$9,300", date: "2024-01-25", dueDate: "2024-02-25", status: "paid" },
  { id: "5", invoiceNumber: "INV-2024-005", customer: "Digital Ventures", amount: "$11,000", date: "2024-02-01", dueDate: "2024-03-01", status: "pending" },
];

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<Invoice>[] = [
    { header: "Invoice #", accessor: "invoiceNumber", className: "font-mono" },
    { header: "Customer", accessor: "customer" },
    { header: "Amount", accessor: "amount", className: "font-semibold" },
    { header: "Date", accessor: "date" },
    { header: "Due Date", accessor: "dueDate" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting invoices as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting invoices as PDF");
  };

  const handleRowClick = (invoice: Invoice) => {
    console.log("Opening invoice:", invoice.invoiceNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all sales invoices
          </p>
        </div>
        <Button data-testid="button-create-invoice">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-invoices"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockInvoices}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={3}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
