import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/data-table";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, Pencil, Trash2, DollarSign, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStockSchema, type Stock, type InsertStock } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CATEGORIES = ["Electronics", "Furniture", "Office Supplies", "Raw Materials", "Finished Goods", "Other"];

export default function Stock() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const { toast } = useToast();

  const { data: stockItems = [], isLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stock"],
  });

  const form = useForm<InsertStock>({
    resolver: zodResolver(insertStockSchema),
    defaultValues: {
      productName: "",
      sku: "",
      category: "",
      quantity: 0,
      unitPrice: "",
      reorderLevel: 10,
      supplier: "",
      lastRestocked: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertStock) => apiRequest("/api/stock", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Stock item created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating stock item", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertStock> }) =>
      apiRequest(`/api/stock/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      setIsDialogOpen(false);
      setEditingStock(null);
      form.reset();
      toast({ title: "Stock item updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating stock item", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/stock/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      toast({ title: "Stock item deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting stock item", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertStock) => {
    if (editingStock) {
      updateMutation.mutate({ id: editingStock.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    form.reset({
      productName: stock.productName,
      sku: stock.sku,
      category: stock.category,
      quantity: stock.quantity,
      unitPrice: stock.unitPrice,
      reorderLevel: stock.reorderLevel,
      supplier: stock.supplier || "",
      lastRestocked: stock.lastRestocked || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingStock(null);
      form.reset();
    }
  };

  const filteredStock = stockItems.filter((item) =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Stock>[] = [
    { 
      header: "SKU", 
      accessor: "sku", 
      className: "font-mono text-sm" 
    },
    { 
      header: "Product Name", 
      accessor: "productName", 
      className: "font-medium" 
    },
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
          {row.quantity <= row.reorderLevel && (
            <Badge variant="destructive" className="ml-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low
            </Badge>
          )}
        </div>
      ),
    },
    { 
      header: "Unit Price", 
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {parseFloat(row.unitPrice).toLocaleString()}
        </div>
      ),
    },
    { 
      header: "Total Value", 
      accessor: (row) => (
        <div className="flex items-center gap-1 font-semibold">
          <DollarSign className="h-3 w-3" />
          {(row.quantity * parseFloat(row.unitPrice)).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            data-testid={`button-edit-stock-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-stock-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Stock Item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {row.productName}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const handleExportCSV = () => {
    console.log("Exporting stock as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting stock as PDF");
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
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-stock">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingStock ? "Edit Stock Item" : "Add New Stock Item"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter product name" data-testid="input-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., PRD-001" className="font-mono" data-testid="input-sku" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="0" 
                            data-testid="input-quantity" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            data-testid="input-unit-price" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reorderLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Level *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="10" 
                            data-testid="input-reorder-level" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastRestocked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Restocked (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} data-testid="input-last-restocked" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Supplier name" data-testid="input-supplier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-stock"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Stock Item"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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

      {isLoading ? (
        <div className="text-center py-10">Loading stock items...</div>
      ) : (
        <DataTable
          data={filteredStock}
          columns={columns}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      )}
    </div>
  );
}
