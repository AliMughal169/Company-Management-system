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
import { insertExitSchema, type Exit, type Employee, type InsertExit } from "@shared/schema";
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

const EXIT_TYPES = ["resignation", "termination", "retirement", "other"];

export default function ExitManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExit, setEditingExit] = useState<Exit | null>(null);
  const { toast } = useToast();

  const { data: exits = [], isLoading } = useQuery<Exit[]>({
    queryKey: ["/api/exit"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<InsertExit>({
    resolver: zodResolver(insertExitSchema),
    defaultValues: {
      employeeId: 0,
      exitDate: "",
      reason: "",
      exitType: "",
      feedback: "",
      finalSettlement: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertExit) => apiRequest("/api/exit", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exit"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Exit record created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating exit record", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertExit> }) =>
      apiRequest(`/api/exit/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exit"] });
      setIsDialogOpen(false);
      setEditingExit(null);
      form.reset();
      toast({ title: "Exit record updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating exit record", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/exit/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exit"] });
      toast({ title: "Exit record deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting exit record", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertExit) => {
    if (editingExit) {
      updateMutation.mutate({ id: editingExit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (exit: Exit) => {
    setEditingExit(exit);
    form.reset({
      employeeId: exit.employeeId,
      exitDate: exit.exitDate,
      reason: exit.reason,
      exitType: exit.exitType,
      feedback: exit.feedback || "",
      finalSettlement: exit.finalSettlement || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingExit(null);
      form.reset();
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const filteredExits = exits.filter((exit) => {
    const employeeName = getEmployeeName(exit.employeeId);
    return employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exit.exitType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Exit>[] = [
    {
      header: "Employee",
      accessor: (row) => getEmployeeName(row.employeeId),
      className: "font-medium",
    },
    {
      header: "Exit Date",
      accessor: "exitDate",
    },
    {
      header: "Exit Type",
      accessor: (row) => (
        <Badge variant="secondary">{row.exitType}</Badge>
      ),
    },
    {
      header: "Reason",
      accessor: "reason",
    },
    {
      header: "Final Settlement",
      accessor: (row) => row.finalSettlement ? `$${parseFloat(row.finalSettlement).toLocaleString()}` : "N/A",
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
            data-testid={`button-edit-exit-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-exit-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Exit Record?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this exit record. This action cannot be undone.
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
          <h1 className="text-3xl font-bold">Exit Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee exit processes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-exit">
              <Plus className="h-4 w-4 mr-2" />
              Add Exit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExit ? "Edit Exit Record" : "Add New Exit Record"}</DialogTitle>
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
                    name="exitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-exit-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-exit-type">
                              <SelectValue placeholder="Select exit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXIT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    name="finalSettlement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Settlement</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value || ""}
                              onChange={field.onChange}
                              className="pl-9"
                              data-testid="input-final-settlement"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter reason for exit" data-testid="input-reason" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea value={field.value || ""} onChange={field.onChange} placeholder="Enter feedback" data-testid="input-feedback" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-exit">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingExit ? "Update" : "Create"}
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
            placeholder="Search exit records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-exit"
          />
        </div>
      </div>

      <DataTable
        data={filteredExits}
        columns={columns}
        onRowClick={() => {}}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}
