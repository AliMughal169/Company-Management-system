import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { insertTrainingSchema, type Training, type Employee, type InsertTraining } from "@shared/schema";
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

const STATUSES = ["scheduled", "ongoing", "completed", "cancelled"];

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const { toast } = useToast();

  const { data: trainings = [], isLoading } = useQuery<Training[]>({
    queryKey: ["/api/training"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<InsertTraining>({
    resolver: zodResolver(insertTrainingSchema),
    defaultValues: {
      employeeId: 0,
      trainingName: "",
      provider: "",
      startDate: "",
      endDate: "",
      status: "scheduled",
      cost: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTraining) => apiRequest("/api/training", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Training created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating training", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTraining> }) =>
      apiRequest(`/api/training/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      setIsDialogOpen(false);
      setEditingTraining(null);
      form.reset();
      toast({ title: "Training updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating training", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/training/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({ title: "Training deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting training", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertTraining) => {
    if (editingTraining) {
      updateMutation.mutate({ id: editingTraining.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    form.reset({
      employeeId: training.employeeId,
      trainingName: training.trainingName,
      provider: training.provider || "",
      startDate: training.startDate,
      endDate: training.endDate,
      status: training.status,
      cost: training.cost || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTraining(null);
      form.reset();
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const filteredTrainings = trainings.filter((training) => {
    const employeeName = getEmployeeName(training.employeeId);
    return employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.trainingName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      scheduled: "secondary",
      ongoing: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  const columns: Column<Training>[] = [
    {
      header: "Employee",
      accessor: (row) => getEmployeeName(row.employeeId),
      className: "font-medium",
    },
    {
      header: "Training Name",
      accessor: "trainingName",
    },
    {
      header: "Provider",
      accessor: (row) => row.provider || "N/A",
    },
    {
      header: "Start Date",
      accessor: "startDate",
    },
    {
      header: "End Date",
      accessor: "endDate",
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: "Cost",
      accessor: (row) => row.cost ? `$${parseFloat(row.cost).toLocaleString()}` : "N/A",
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
            data-testid={`button-edit-training-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-training-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Training?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this training record. This action cannot be undone.
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
          <h1 className="text-3xl font-bold">Training</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee training programs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-training">
              <Plus className="h-4 w-4 mr-2" />
              Add Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTraining ? "Edit Training" : "Add New Training"}</DialogTitle>
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
                    name="trainingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Leadership Training" data-testid="input-training-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <FormControl>
                          <Input value={field.value || ""} onChange={field.onChange} placeholder="e.g., Coursera" data-testid="input-provider" />
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
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-end-date" />
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
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
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
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value || ""}
                              onChange={field.onChange}
                              className="pl-9"
                              data-testid="input-cost"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-training">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingTraining ? "Update" : "Create"}
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
            placeholder="Search training..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-training"
          />
        </div>
      </div>

      <DataTable
        data={filteredTrainings}
        columns={columns}
        onRowClick={() => {}}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}
