import { useState, useEffect } from "react";
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
import {
  insertInvoiceSchema,
  type Invoice,
  type Customer,
  type TaxRate,
  type InvoiceNote,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
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

import { ProductAutocomplete } from "@/components/product-autocomplete";

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  stockId?: number;  // ← ADD THIS
  sku?: string;      // ← ADD THIS
}

const invoiceFormSchema = insertInvoiceSchema
  .omit({ items: true, subtotal: true, tax: true, total: true })
  .extend({
    lineItems: z
      .array(
        z.object({
          description: z.string().min(1, "Description is required"),
          quantity: z.number().min(1, "Quantity must be at least 1"),
          rate: z.number().min(0, "Rate must be positive"),
        }),
      )
      .min(1, "At least one line item is required"),
    taxRateId: z.number().optional(),
  });

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    stockId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }>>([]);
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: taxRates = [] } = useQuery<TaxRate[]>({
    queryKey: ["/api/tax-rates"],
  });

  const { data: invoiceNotes = [] } = useQuery<InvoiceNote[]>({
    queryKey: ["/api/invoice-notes"],
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      customerId: 0,
      issueDate: "",
      dueDate: "",
      status: "pending",
      notes: "",
      lineItems: [{ description: "", quantity: 1, rate: 0 }],
      taxRateId: undefined,
    },
  });

  // Fetch next invoice number when opening create dialog
  useEffect(() => {
    if (isDialogOpen && !editingInvoice) {
      fetch("/api/id-sequences/invoice/preview")
        .then((res) => res.json())
        .then((data) => {
          form.setValue("invoiceNumber", data.id);
        })
        .catch((error) => {
          console.error("Error fetching next invoice ID:", error);
        });
    }
  }, [isDialogOpen, editingInvoice, form]);

  const lineItems = form.watch("lineItems") || [];
  const selectedTaxRateId = form.watch("taxRateId");

  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0,
    );
    let taxPercentage = 0;

    if (selectedTaxRateId) {
      const selectedTaxRate = taxRates.find((t) => t.id === selectedTaxRateId);
      if (selectedTaxRate) {
        taxPercentage = parseFloat(selectedTaxRate.percentage) / 100;
      }
    }

    const tax = subtotal * taxPercentage;
    const total = subtotal + tax;
    return { subtotal, tax, total, taxPercentage: taxPercentage * 100 };
  };

  const { subtotal, tax, total, taxPercentage } = calculateTotals();

  const createMutation = useMutation({
    mutationFn: (data: typeof insertInvoiceSchema._type) =>
      apiRequest("/api/invoices", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Invoice created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/invoices/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsDialogOpen(false);
      setEditingInvoice(null);
      form.reset();
      toast({ title: "Invoice updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/invoices/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InvoiceFormData) => {
    const { lineItems, ...rest } = data;
    const { subtotal, tax, total } = calculateTotals();

    let invoiceNumber = rest.invoiceNumber;

    // Generate next ID when creating a new invoice
    if (!editingInvoice) {
      try {
        const response = await fetch("/api/id-sequences/invoice/next", {
          method: "POST",
        });
        const idData = await response.json();
        invoiceNumber = idData.id;
      } catch (error) {
        console.error("Error generating invoice ID:", error);
        toast({
          title: "Error generating invoice number",
          variant: "destructive",
        });
        return;
      }
    }

    const invoiceData = {
      ...rest,
      invoiceNumber,
      items: JSON.stringify(lineItems),
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
    };

    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: invoiceData });
    } else {
      createMutation.mutate(invoiceData);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    const parsedItems = JSON.parse(invoice.items);
    form.reset({
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      notes: invoice.notes || "",
      lineItems: parsedItems,
      taxRateId: (invoice as any).taxRateId ?? undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingInvoice(null);
      form.reset();
    }
  };

  const addLineItem = () => {
    const currentItems = form.getValues("lineItems");
    form.setValue("lineItems", [
      ...currentItems,
      { description: "", quantity: 1, rate: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues("lineItems");
    if (currentItems.length > 1) {
      form.setValue(
        "lineItems",
        currentItems.filter((_, i) => i !== index),
      );
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(invoice.customerId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const columns: Column<Invoice>[] = [
    { header: "Invoice #", accessor: "invoiceNumber", className: "font-mono" },
    {
      header: "Customer",
      accessor: (row) => getCustomerName(row.customerId),
    },
    {
      header: "Total",
      accessor: (row) => `$${parseFloat(row.total).toLocaleString()}`,
      className: "font-semibold",
    },
    { header: "Issue Date", accessor: "issueDate" },
    { header: "Due Date", accessor: "dueDate" },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.status as "paid" | "pending" | "overdue"} />
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
            data-testid={`button-edit-invoice-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-invoice-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {row.invoiceNumber}. This action
                  cannot be undone.
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
    console.log("Exporting invoices as CSV");
  };

  const handleExportPDF = () => {
    console.log("Exporting invoices as PDF");
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
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-invoice">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-muted"
                            data-testid="input-invoice-number"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Auto-generated
                        </p>
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-customer">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={customer.id.toString()}
                              >
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
                          <Input
                            type="date"
                            {...field}
                            data-testid="input-issue-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            data-testid="input-due-date"
                          />
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="taxRateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === "none") {
                            field.onChange(undefined);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-tax-rate">
                            <SelectValue placeholder="Select tax rate (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Tax</SelectItem>
                          {taxRates.map((taxRate) => (
                            <SelectItem
                              key={taxRate.id}
                              value={taxRate.id.toString()}
                            >
                              {taxRate.name} ({taxRate.percentage}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Line Items</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLineItem}
                      data-testid="button-add-line-item"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {lineItems.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ProductAutocomplete
                                  value={field.value}
                                  onChange={field.onChange}
                                  onSelectProduct={(product) => {
                                    setSelectedProduct(product);
                                    form.setValue(
                                      `lineItems.${index}.rate`,
                                      parseFloat(product.unitPrice),
                                    );
                                    // ← ADD THESE TWO LINES:
                                    (form.getValues('lineItems')[index] as                                             any).stockId = product.id;
                                    (form.getValues('lineItems')[index] as                                             any).sku = product.sku;
                                  }}
                                  label=""
                                  placeholder="Search products..."
                                  required
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
                          name={`lineItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
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
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
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
                        <span className="text-sm font-medium">
                          $
                          {(
                            lineItems[index].quantity * lineItems[index].rate
                          ).toFixed(2)}
                        </span>
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
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        Tax {taxPercentage > 0 ? `(${taxPercentage}%)` : ""}:
                      </span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Notes</FormLabel>
                  {invoiceNotes.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const selectedNote = invoiceNotes.find(
                          (n) => n.id.toString() === value,
                        );
                        if (selectedNote) {
                          form.setValue("notes", selectedNote.content);
                        }
                      }}
                    >
                      <SelectTrigger data-testid="select-invoice-notes">
                        <SelectValue placeholder="Select a note template or type custom note below" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoiceNotes.map((note) => (
                          <SelectItem key={note.id} value={note.id.toString()}>
                            {note.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                      <p className="text-sm text-muted-foreground flex-1">
                        No note templates available
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open("/settings", "_blank")}
                        data-testid="button-create-note-template"
                      >
                        Create Template
                      </Button>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Type custom notes or select a template above..."
                            rows={3}
                            data-testid="input-invoice-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    data-testid="button-save-invoice"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : "Save Invoice"}
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
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-invoices"
          />
        </div>
        <ExportButton
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading invoices...</div>
      ) : (
        <DataTable
          data={filteredInvoices}
          columns={columns}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      )}
    </div>
  );
}
