import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, FileText, Download } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
interface EmployeeDocument {
  id: string;
  employeeName: string;
  documentType: string;
  fileName: string;
  uploadDate: string;
  expiryDate: string;
  size: string;
}

const mockDocuments: EmployeeDocument[] = [
  { id: "1", employeeName: "John Doe", documentType: "Contract", fileName: "employment_contract.pdf", uploadDate: "2024-01-15", expiryDate: "2025-01-15", size: "245 KB" },
  { id: "2", employeeName: "Jane Smith", documentType: "ID Card", fileName: "national_id.pdf", uploadDate: "2024-01-20", expiryDate: "2028-05-10", size: "180 KB" },
  { id: "3", employeeName: "Mike Johnson", documentType: "Certificate", fileName: "degree_certificate.pdf", uploadDate: "2024-02-01", expiryDate: "-", size: "320 KB" },
  { id: "4", employeeName: "Sarah Williams", documentType: "Tax Form", fileName: "tax_declaration_2024.pdf", uploadDate: "2024-01-10", expiryDate: "2024-12-31", size: "95 KB" },
  { id: "5", employeeName: "Tom Brown", documentType: "Contract", fileName: "employment_contract.pdf", uploadDate: "2024-02-05", expiryDate: "2025-02-05", size: "238 KB" },
];

const documentCategories = [
  { name: "Contracts", count: 24, color: "bg-chart-1/20 text-chart-1" },
  { name: "Certificates", count: 18, color: "bg-chart-2/20 text-chart-2" },
  { name: "ID Documents", count: 32, color: "bg-chart-3/20 text-chart-3" },
  { name: "Tax Forms", count: 15, color: "bg-chart-4/20 text-chart-4" },
];

export default function EmployeeDocuments() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<EmployeeDocument>[] = [
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
    {
      header: "Document Type",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal" data-testid={`badge-document-type-${row.id}`}>
          {row.documentType}
        </Badge>
      ),
    },
    {
      header: "File Name",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{row.fileName}</span>
        </div>
      ),
    },
    { header: "Upload Date", accessor: "uploadDate" },
    { header: "Expiry Date", accessor: "expiryDate" },
    { header: "Size", accessor: "size", className: "text-muted-foreground" },
    {
      header: "",
      accessor: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Downloading:", row.fileName);
          }}
          data-testid={`button-download-${row.id}`}
        >
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Documents</h1>
          <p className="text-muted-foreground mt-1">
            Store and manage employee documents securely
          </p>
        </div>
        <Button data-testid="button-upload-document">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {documentCategories.map((category, index) => (
          <div key={index} className="bg-card border border-card-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{category.name}</p>
                <p className="text-2xl font-bold mt-1">{category.count}</p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${category.color}`}>
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-documents"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-type">
          Filter by Type
        </Button>
      </div>

      <DataTable
        data={mockDocuments}
        columns={columns}
        currentPage={1}
        totalPages={3}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
