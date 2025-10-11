import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { insertBenefitSchema, type Benefit, type Employee, type InsertBenefit } from "@shared/schema";
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
import { Badge } from "@/components/ui/badge";

const BENEFIT_TYPES = ["health_insurance", "retirement", "gym", "transport", "other"];

export default function Benefits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const { toast } = useToast();

  const { data: benefits = [], isLoading } = useQuery<Benefit[]>({
    queryKey: ["/api/benefits"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<InsertBenefit>({
    resolver: zodResolver(insertBenefitSchema),
    defaultValues: {
      employeeId: 0,
      benefitType: "",
      description: "",
      amount: null,
      startDate: "",
      endDate: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBenefit) => apiRequest("/api/benefits", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benefits"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Benefit created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating benefit", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBenefit> }) =>
      apiRequest(`/api/benefits/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benefits"] });
      setIsDialogOpen(false);
      setEditingBenefit(null);
      form.reset();
      toast({ title: "Benefit updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating benefit", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/benefits/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benefits"] });
      toast({ title: "Benefit deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting benefit", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertBenefit) => {
    if (editingBenefit) {
      updateMutation.mutate({ id: editingBenefit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    form.reset({
      employeeId: benefit.employeeId,
      benefitType: benefit.benefitType,
      description: benefit.description,
      amount: benefit.amount || null,
      startDate: benefit.startDate,
      endDate: benefit.endDate || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBenefit(null);
      form.reset();
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const filteredBenefits = benefits.filter((benefit) => {
    const employeeName = getEmployeeName(benefit.employeeId);
    return employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      benefit.benefitType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Benefit>[] = [
    {
      header: "Employee",
      accessor: (row) => getEmployeeName(row.employeeId),
      className: "font-medium",
    },
    {
      header: "Benefit Type",
      accessor: (row) => (
        <Badge variant="secondary">{row.benefitType.replace("_", " ")}</Badge>
      ),
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Amount",
      accessor: (row) => row.amount ? `$${parseFloat(row.amount).toLocaleString()}` : "N/A",
    },
    {
      header: "Start Date",
      accessor: "startDate",
    },
    {
      header: "End Date",
      accessor: (row) => row.endDate || "N/A",
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
            data-testid={`button-edit-benefit-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-benefit-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Benefit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this benefit. This action cannot be undone.
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

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Benefits</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee benefits
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-benefit">
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBenefit ? "Edit Benefit" : "Add New Benefit"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee *</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-employee">
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="benefitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefit Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-benefit-type">
                              <SelectValue placeholder="Select benefit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BENEFIT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value || ""}
                              onChange={field.onChange}
                              className="pl-9"
                              data-testid="input-amount"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value || ""}
                            onChange={field.onChange}
                            data-testid="input-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter benefit description" data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-benefit">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingBenefit ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-benefits"
          />
        </div>
      </div>

      <DataTable
        data={filteredBenefits}
        columns={columns}
        onRowClick={() => {}}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}
