import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// todo: remove mock functionality
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
  status: "active" | "inactive";
}

const mockCustomers: Customer[] = [
  { id: "1", name: "Acme Corp", email: "contact@acme.com", phone: "+1 234-567-8901", totalOrders: 23, totalSpent: "$45,000", status: "active" },
  { id: "2", name: "TechStart Inc", email: "info@techstart.com", phone: "+1 234-567-8902", totalOrders: 18, totalSpent: "$38,500", status: "active" },
  { id: "3", name: "Global Solutions", email: "hello@global.com", phone: "+1 234-567-8903", totalOrders: 15, totalSpent: "$32,000", status: "active" },
  { id: "4", name: "Innovation Labs", email: "team@innovation.com", phone: "+1 234-567-8904", totalOrders: 8, totalSpent: "$15,750", status: "inactive" },
  { id: "5", name: "Digital Ventures", email: "sales@digital.com", phone: "+1 234-567-8905", totalOrders: 12, totalSpent: "$28,300", status: "active" },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    { header: "Total Orders", accessor: "totalOrders" },
    { header: "Total Spent", accessor: "totalSpent", className: "font-semibold" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting customers as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting customers as PDF");
  };

  const handleRowClick = (customer: Customer) => {
    console.log("Opening customer:", customer.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer information and relationships
          </p>
        </div>
        <Button data-testid="button-add-customer">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-customers"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockCustomers}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
