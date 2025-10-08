import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ArrowRight } from "lucide-react";

// todo: remove mock functionality
interface ProformaInvoice {
  id: string;
  proformaNumber: string;
  customer: string;
  amount: string;
  date: string;
  validUntil: string;
  status: "draft" | "pending" | "approved";
}

const mockProformaInvoices: ProformaInvoice[] = [
  { id: "1", proformaNumber: "PRO-2024-001", customer: "Future Tech", amount: "$18,500", date: "2024-02-01", validUntil: "2024-03-01", status: "approved" },
  { id: "2", proformaNumber: "PRO-2024-002", customer: "Smart Systems", amount: "$22,300", date: "2024-02-05", validUntil: "2024-03-05", status: "pending" },
  { id: "3", proformaNumber: "PRO-2024-003", customer: "Next Gen Inc", amount: "$14,750", date: "2024-02-08", validUntil: "2024-03-08", status: "draft" },
  { id: "4", proformaNumber: "PRO-2024-004", customer: "Tech Pioneers", amount: "$31,200", date: "2024-02-10", validUntil: "2024-03-10", status: "approved" },
];

export default function ProformaInvoices() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<ProformaInvoice>[] = [
    { header: "Proforma #", accessor: "proformaNumber", className: "font-mono" },
    { header: "Customer", accessor: "customer" },
    { header: "Amount", accessor: "amount", className: "font-semibold" },
    { header: "Date", accessor: "date" },
    { header: "Valid Until", accessor: "validUntil" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "",
      accessor: (row) => (
        row.status === "approved" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Converting to invoice:", row.proformaNumber);
            }}
            data-testid={`button-convert-${row.id}`}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Convert
          </Button>
        )
      ),
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting proforma invoices as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting proforma invoices as PDF");
  };

  const handleRowClick = (invoice: ProformaInvoice) => {
    console.log("Opening proforma invoice:", invoice.proformaNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proforma Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage proforma invoices and convert to sales invoices
          </p>
        </div>
        <Button data-testid="button-create-proforma">
          <Plus className="h-4 w-4 mr-2" />
          Create Proforma
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proforma invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-proforma"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockProformaInvoices}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
