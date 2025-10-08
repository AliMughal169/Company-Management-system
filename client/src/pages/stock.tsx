import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
interface StockItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: string;
  totalValue: string;
  status: "in-stock" | "low" | "out-of-stock";
}

const mockStockItems: StockItem[] = [
  { id: "1", sku: "PRD-001", productName: "Laptop Pro 15", category: "Electronics", quantity: 45, unitPrice: "$1,200", totalValue: "$54,000", status: "in-stock" },
  { id: "2", sku: "PRD-002", productName: "Wireless Mouse", category: "Accessories", quantity: 8, unitPrice: "$25", totalValue: "$200", status: "low" },
  { id: "3", sku: "PRD-003", productName: "Office Chair", category: "Furniture", quantity: 120, unitPrice: "$250", totalValue: "$30,000", status: "in-stock" },
  { id: "4", sku: "PRD-004", productName: "Monitor 27\"", category: "Electronics", quantity: 0, unitPrice: "$350", totalValue: "$0", status: "out-of-stock" },
  { id: "5", sku: "PRD-005", productName: "Desk Lamp", category: "Accessories", quantity: 65, unitPrice: "$45", totalValue: "$2,925", status: "in-stock" },
];

export default function Stock() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<StockItem>[] = [
    { header: "SKU", accessor: "sku", className: "font-mono text-sm" },
    { header: "Product Name", accessor: "productName", className: "font-medium" },
    {
      header: "Category",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal">
          {row.category}
        </Badge>
      ),
    },
    {
      header: "Quantity",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{row.quantity}</span>
        </div>
      ),
    },
    { header: "Unit Price", accessor: "unitPrice" },
    { header: "Total Value", accessor: "totalValue", className: "font-semibold" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting stock as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting stock as PDF");
  };

  const handleRowClick = (item: StockItem) => {
    console.log("Opening stock item:", item.productName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground mt-1">
            Track inventory and manage stock levels
          </p>
        </div>
        <Button data-testid="button-add-stock">
          <Plus className="h-4 w-4 mr-2" />
          Add Stock Item
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stock items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-stock"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      <DataTable
        data={mockStockItems}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
