import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data-table";
import { Plus, Pencil, Trash2, Settings as SettingsIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertTaxRateSchema, 
  insertInvoiceNoteSchema,
  insertIdSequenceSchema,
  type TaxRate, 
  type InvoiceNote,
  type IdSequence,
  type InsertTaxRate,
  type InsertInvoiceNote,
  type InsertIdSequence
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  // Tax Rates State
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);

  // Invoice Notes State
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<InvoiceNote | null>(null);

  // ID Sequences State
  const [isSeqDialogOpen, setIsSeqDialogOpen] = useState(false);
  const [editingSeq, setEditingSeq] = useState<IdSequence | null>(null);

  // Currency State
  const [currency, setCurrency] = useState("USD");

  // Fetch Tax Rates
  const { data: taxRates = [] } = useQuery<TaxRate[]>({
    queryKey: ["/api/tax-rates"],
  });

  // Fetch Invoice Notes
  const { data: invoiceNotes = [] } = useQuery<InvoiceNote[]>({
    queryKey: ["/api/invoice-notes"],
  });

  // Fetch ID Sequences
  const { data: idSequences = [] } = useQuery<IdSequence[]>({
    queryKey: ["/api/id-sequences"],
  });

  // Initialize default ID sequences if none exist
  useEffect(() => {
    if (idSequences.length === 0) {
      fetch("/api/id-sequences/initialize", { method: "POST" })
        .then(() => queryClient.invalidateQueries({ queryKey: ["/api/id-sequences"] }))
        .catch(error => console.error("Error initializing ID sequences:", error));
    }
  }, [idSequences]);

  // Tax Rate Form
  const taxForm = useForm<InsertTaxRate>({
    resolver: zodResolver(insertTaxRateSchema),
    defaultValues: {
      name: "",
      percentage: "0",
      isDefault: false,
    },
  });

  // Invoice Note Form
  const noteForm = useForm<InsertInvoiceNote>({
    resolver: zodResolver(insertInvoiceNoteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // ID Sequence Form
  const seqForm = useForm<InsertIdSequence>({
    resolver: zodResolver(insertIdSequenceSchema),
    defaultValues: {
      module: "",
      prefix: "",
      nextNumber: 1,
    },
  });

  // Tax Rate Mutations
  const createTaxMutation = useMutation({
    mutationFn: (data: InsertTaxRate) => apiRequest("/api/tax-rates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-rates"] });
      setIsTaxDialogOpen(false);
      taxForm.reset();
      toast({ title: "Tax rate created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating tax rate", description: error.message, variant: "destructive" });
    },
  });

  const updateTaxMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTaxRate> }) =>
      apiRequest(`/api/tax-rates/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-rates"] });
      setIsTaxDialogOpen(false);
      setEditingTax(null);
      taxForm.reset();
      toast({ title: "Tax rate updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating tax rate", description: error.message, variant: "destructive" });
    },
  });

  const deleteTaxMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/tax-rates/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-rates"] });
      toast({ title: "Tax rate deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting tax rate", description: error.message, variant: "destructive" });
    },
  });

  // Invoice Note Mutations
  const createNoteMutation = useMutation({
    mutationFn: (data: InsertInvoiceNote) => apiRequest("/api/invoice-notes", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-notes"] });
      setIsNoteDialogOpen(false);
      noteForm.reset();
      toast({ title: "Note template created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating note", description: error.message, variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertInvoiceNote> }) =>
      apiRequest(`/api/invoice-notes/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-notes"] });
      setIsNoteDialogOpen(false);
      setEditingNote(null);
      noteForm.reset();
      toast({ title: "Note template updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating note", description: error.message, variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/invoice-notes/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-notes"] });
      toast({ title: "Note template deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting note", description: error.message, variant: "destructive" });
    },
  });

  // ID Sequence Mutations
  const createSeqMutation = useMutation({
    mutationFn: (data: InsertIdSequence) => apiRequest("/api/id-sequences", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/id-sequences"] });
      setIsSeqDialogOpen(false);
      seqForm.reset();
      toast({ title: "ID sequence created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating sequence", description: error.message, variant: "destructive" });
    },
  });

  const updateSeqMutation = useMutation({
    mutationFn: ({ module, data }: { module: string; data: Partial<InsertIdSequence> }) =>
      apiRequest(`/api/id-sequences/${module}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/id-sequences"] });
      setIsSeqDialogOpen(false);
      setEditingSeq(null);
      seqForm.reset();
      toast({ title: "ID sequence updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating sequence", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleTaxDialogClose = (open: boolean) => {
    setIsTaxDialogOpen(open);
    if (!open) {
      setEditingTax(null);
      taxForm.reset();
    }
  };

  const handleNoteDialogClose = (open: boolean) => {
    setIsNoteDialogOpen(open);
    if (!open) {
      setEditingNote(null);
      noteForm.reset();
    }
  };

  const handleSeqDialogClose = (open: boolean) => {
    setIsSeqDialogOpen(open);
    if (!open) {
      setEditingSeq(null);
      seqForm.reset();
    }
  };

  const onTaxSubmit = (data: InsertTaxRate) => {
    if (editingTax) {
      updateTaxMutation.mutate({ id: editingTax.id, data });
    } else {
      createTaxMutation.mutate(data);
    }
  };

  const onNoteSubmit = (data: InsertInvoiceNote) => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data });
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const onSeqSubmit = (data: InsertIdSequence) => {
    if (editingSeq) {
      updateSeqMutation.mutate({ module: editingSeq.module, data });
    } else {
      createSeqMutation.mutate(data);
    }
  };

  const handleEditTax = (tax: TaxRate) => {
    setEditingTax(tax);
    taxForm.reset({
      name: tax.name,
      percentage: tax.percentage,
      isDefault: tax.isDefault,
    });
    setIsTaxDialogOpen(true);
  };

  const handleEditNote = (note: InvoiceNote) => {
    setEditingNote(note);
    noteForm.reset({
      title: note.title,
      content: note.content,
    });
    setIsNoteDialogOpen(true);
  };

  const handleEditSeq = (seq: IdSequence) => {
    setEditingSeq(seq);
    seqForm.reset({
      module: seq.module,
      prefix: seq.prefix,
      nextNumber: seq.nextNumber,
    });
    setIsSeqDialogOpen(true);
  };

  // Table Columns
  const taxColumns: Column<TaxRate>[] = [
    { header: "Tax Name", accessor: "name" },
    { 
      header: "Rate (%)", 
      accessor: (row) => `${row.percentage}%`
    },
    {
      header: "Default",
      accessor: (row) => row.isDefault ? "Yes" : "No",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditTax(row)}
            data-testid={`button-edit-tax-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                data-testid={`button-delete-tax-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Tax Rate</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this tax rate?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteTaxMutation.mutate(row.id)}
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

  const noteColumns: Column<InvoiceNote>[] = [
    { header: "Title", accessor: "title" },
    { 
      header: "Content", 
      accessor: (row) => (
        <div className="max-w-md truncate" title={row.content}>
          {row.content}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditNote(row)}
            data-testid={`button-edit-note-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                data-testid={`button-delete-note-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this note template?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteNoteMutation.mutate(row.id)}
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

  const seqColumns: Column<IdSequence>[] = [
    { header: "Module", accessor: "module" },
    { header: "Prefix", accessor: "prefix" },
    { header: "Next Number", accessor: "nextNumber" },
    {
      header: "Preview",
      accessor: (row) => `${row.prefix}${String(row.nextNumber).padStart(4, '0')}`,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEditSeq(row)}
          data-testid={`button-edit-seq-${row.module}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="tax" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tax">Tax Rates</TabsTrigger>
          <TabsTrigger value="notes">Invoice Notes</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="sequences">ID Sequences</TabsTrigger>
        </TabsList>

        {/* Tax Rates Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tax Rates</CardTitle>
                  <CardDescription>Manage tax rates for invoices</CardDescription>
                </div>
                <Dialog open={isTaxDialogOpen} onOpenChange={handleTaxDialogClose}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-tax-rate">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tax Rate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTax ? "Edit Tax Rate" : "Add Tax Rate"}</DialogTitle>
                    </DialogHeader>
                    <Form {...taxForm}>
                      <form onSubmit={taxForm.handleSubmit(onTaxSubmit)} className="space-y-4">
                        <FormField
                          control={taxForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., VAT, GST" data-testid="input-tax-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taxForm.control}
                          name="percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Percentage *</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" placeholder="e.g., 10.00" data-testid="input-tax-percentage" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taxForm.control}
                          name="isDefault"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Set as Default</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  This tax rate will be pre-selected in new invoices
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-tax-default"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => handleTaxDialogClose(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createTaxMutation.isPending || updateTaxMutation.isPending} data-testid="button-save-tax-rate">
                            {createTaxMutation.isPending || updateTaxMutation.isPending ? "Saving..." : "Save Tax Rate"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={taxColumns} data={taxRates} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Note Templates</CardTitle>
                  <CardDescription>Create reusable note templates for invoices</CardDescription>
                </div>
                <Dialog open={isNoteDialogOpen} onOpenChange={handleNoteDialogClose}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-note">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingNote ? "Edit Note Template" : "Add Note Template"}</DialogTitle>
                    </DialogHeader>
                    <Form {...noteForm}>
                      <form onSubmit={noteForm.handleSubmit(onNoteSubmit)} className="space-y-4">
                        <FormField
                          control={noteForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Payment Terms" data-testid="input-note-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={noteForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Enter note content..."
                                  rows={5}
                                  data-testid="input-note-content"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => handleNoteDialogClose(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createNoteMutation.isPending || updateNoteMutation.isPending} data-testid="button-save-note">
                            {createNoteMutation.isPending || updateNoteMutation.isPending ? "Saving..." : "Save Note"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={noteColumns} data={invoiceNotes} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Tab */}
        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>Configure default currency for the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[200px]" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button data-testid="button-save-currency">Save Currency Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ID Sequences Tab */}
        <TabsContent value="sequences" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ID Sequence Configuration</CardTitle>
                  <CardDescription>Configure auto-generated ID formats for different modules</CardDescription>
                </div>
                <Dialog open={isSeqDialogOpen} onOpenChange={handleSeqDialogClose}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-sequence">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sequence
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingSeq ? "Edit ID Sequence" : "Add ID Sequence"}</DialogTitle>
                    </DialogHeader>
                    <Form {...seqForm}>
                      <form onSubmit={seqForm.handleSubmit(onSeqSubmit)} className="space-y-4">
                        <FormField
                          control={seqForm.control}
                          name="module"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Module *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!!editingSeq}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-sequence-module">
                                    <SelectValue placeholder="Select module" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="invoice">Invoice</SelectItem>
                                  <SelectItem value="proforma">Proforma Invoice</SelectItem>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="stock">Stock/SKU</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={seqForm.control}
                          name="prefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prefix *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., INV-, PF-, EMP-" data-testid="input-sequence-prefix" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={seqForm.control}
                          name="nextNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Number *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-sequence-next-number"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Preview:</p>
                          <p className="text-lg font-mono">
                            {seqForm.watch("prefix")}{String(seqForm.watch("nextNumber")).padStart(4, '0')}
                          </p>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => handleSeqDialogClose(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createSeqMutation.isPending || updateSeqMutation.isPending} data-testid="button-save-sequence">
                            {createSeqMutation.isPending || updateSeqMutation.isPending ? "Saving..." : "Save Sequence"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={seqColumns} data={idSequences} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
