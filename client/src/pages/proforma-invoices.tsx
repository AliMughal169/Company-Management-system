import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
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
import { z } from "zod";
import { insertProformaInvoiceSchema, type ProformaInvoice, type Customer } from "@shared/schema";
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

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const proformaInvoiceFormSchema = insertProformaInvoiceSchema.omit({ items: true, subtotal: true, tax: true, total: true }).extend({
  lineItems: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
  })).min(1, "At least one line item is required"),
});

type ProformaInvoiceFormData = z.infer<typeof proformaInvoiceFormSchema>;

export default function ProformaInvoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProformaInvoice, setEditingProformaInvoice] = useState<ProformaInvoice | null>(null);
  const { toast } = useToast();

  const { data: proformaInvoices = [], isLoading } = useQuery<ProformaInvoice[]>({
    queryKey: ["/api/proforma-invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<ProformaInvoiceFormData>({
    resolver: zodResolver(proformaInvoiceFormSchema),
    defaultValues: {
      proformaNumber: "",
      customerId: 0,
      issueDate: "",
      validUntil: "",
      status: "draft",
      notes: "",
      lineItems: [{ description: "", quantity: 1, rate: 0 }],
    },
  });

  const lineItems = form.watch("lineItems") || [];

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const createMutation = useMutation({
    mutationFn: (data: typeof insertProformaInvoiceSchema._type) => apiRequest("/api/proforma-invoices", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proforma-invoices"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Proforma Invoice created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating proforma invoice", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/proforma-invoices/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proforma-invoices"] });
      setIsDialogOpen(false);
      setEditingProformaInvoice(null);
      form.reset();
      toast({ title: "Proforma Invoice updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating proforma invoice", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/proforma-invoices/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proforma-invoices"] });
      toast({ title: "Proforma Invoice deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting proforma invoice", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: ProformaInvoiceFormData) => {
    const { lineItems, ...rest } = data;
    const { subtotal, tax, total } = calculateTotals();
    
    const proformaInvoiceData = {
      ...rest,
      items: JSON.stringify(lineItems),
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
    };

    if (editingProformaInvoice) {
      updateMutation.mutate({ id: editingProformaInvoice.id, data: proformaInvoiceData });
    } else {
      createMutation.mutate(proformaInvoiceData);
    }
  };

  const handleEdit = (proformaInvoice: ProformaInvoice) => {
    setEditingProformaInvoice(proformaInvoice);
    const parsedItems = JSON.parse(proformaInvoice.items);
    form.reset({
      proformaNumber: proformaInvoice.proformaNumber,
      customerId: proformaInvoice.customerId,
      issueDate: proformaInvoice.issueDate,
      validUntil: proformaInvoice.validUntil,
      status: proformaInvoice.status,
      notes: proformaInvoice.notes || "",
      lineItems: parsedItems,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProformaInvoice(null);
    form.reset();
  };

  const addLineItem = () => {
    const currentItems = form.getValues("lineItems");
    form.setValue("lineItems", [...currentItems, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues("lineItems");
    if (currentItems.length > 1) {
      form.setValue("lineItems", currentItems.filter((_, i) => i !== index));
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const filteredProformaInvoices = proformaInvoices.filter((proformaInvoice) =>
    proformaInvoice.proformaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCustomerName(proformaInvoice.customerId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<ProformaInvoice>[] = [
    { header: "Proforma #", accessor: "proformaNumber", className: "font-mono" },
    { 
      header: "Customer", 
      accessor: (row) => getCustomerName(row.customerId),
    },
    { 
      header: "Total", 
      accessor: (row) => `$${parseFloat(row.total).toLocaleString()}`, 
      className: "font-semibold" 
    },
    { header: "Issue Date", accessor: "issueDate" },
    { header: "Valid Until", accessor: "validUntil" },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status as "draft" | "sent" | "converted" | "expired"} />,
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
            data-testid={`button-edit-proforma-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-proforma-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Proforma Invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {row.proformaNumber}. This action cannot be undone.
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
    console.log("Exporting proforma invoices as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting proforma invoices as PDF");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proforma Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all proforma invoices
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-proforma">
              <Plus className="h-4 w-4 mr-2" />
              Create Proforma Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProformaInvoice ? "Edit Proforma Invoice" : "Create New Proforma Invoice"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="proformaNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proforma Number *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-proforma-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-customer">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-issue-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-valid-until" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Line Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem} data-testid="button-add-line-item">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {lineItems.map((_, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Description" data-testid={`input-line-item-description-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  placeholder="Qty" 
                                  data-testid={`input-line-item-quantity-${index}`} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="Rate" 
                                  data-testid={`input-line-item-rate-${index}`} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-2">
                        <span className="text-sm font-medium">${(lineItems[index].quantity * lineItems[index].rate).toFixed(2)}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          data-testid={`button-remove-line-item-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (10%):</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Additional notes..." data-testid="input-proforma-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending} 
                    data-testid="button-save-proforma"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Proforma Invoice"}
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
            placeholder="Search proforma invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-proforma"
          />
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading proforma invoices...</div>
      ) : (
        <DataTable
          data={filteredProformaInvoices}
          columns={columns}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      )}
    </div>
  );
}
