import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
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
import { insertPerformanceSchema, type Performance, type Employee, type InsertPerformance } from "@shared/schema";
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

const RATINGS = [1, 2, 3, 4, 5];

export default function PerformanceReviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const { toast } = useToast();

  const { data: performances = [], isLoading } = useQuery<Performance[]>({
    queryKey: ["/api/performance"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<InsertPerformance>({
    resolver: zodResolver(insertPerformanceSchema),
    defaultValues: {
      employeeId: 0,
      reviewDate: "",
      rating: 3,
      goals: "",
      achievements: "",
      feedback: "",
      nextReviewDate: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPerformance) => apiRequest("/api/performance", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Performance review created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating performance review", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPerformance> }) =>
      apiRequest(`/api/performance/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      setIsDialogOpen(false);
      setEditingPerformance(null);
      form.reset();
      toast({ title: "Performance review updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating performance review", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/performance/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      toast({ title: "Performance review deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting performance review", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertPerformance) => {
    if (editingPerformance) {
      updateMutation.mutate({ id: editingPerformance.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (performance: Performance) => {
    setEditingPerformance(performance);
    form.reset({
      employeeId: performance.employeeId,
      reviewDate: performance.reviewDate,
      rating: performance.rating,
      goals: performance.goals || "",
      achievements: performance.achievements || "",
      feedback: performance.feedback || "",
      nextReviewDate: performance.nextReviewDate || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPerformance(null);
      form.reset();
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const filteredPerformances = performances.filter((performance) => {
    const employeeName = getEmployeeName(performance.employeeId);
    return employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      performance.reviewDate.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Performance>[] = [
    {
      header: "Employee",
      accessor: (row) => getEmployeeName(row.employeeId),
      className: "font-medium",
    },
    {
      header: "Review Date",
      accessor: "reviewDate",
    },
    {
      header: "Rating",
      accessor: (row) => (
        <Badge variant="default">{row.rating}/5</Badge>
      ),
    },
    {
      header: "Next Review",
      accessor: (row) => row.nextReviewDate || "N/A",
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
            data-testid={`button-edit-performance-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-performance-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Performance Review?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this performance review. This action cannot be undone.
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
          <h1 className="text-3xl font-bold">Performance Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee performance reviews
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-performance">
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPerformance ? "Edit Performance Review" : "Add New Performance Review"}</DialogTitle>
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
                    name="reviewDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-review-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating *</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-rating">
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RATINGS.map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} Stars
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
                    name="nextReviewDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Review Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value || ""}
                            onChange={field.onChange}
                            data-testid="input-next-review-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goals</FormLabel>
                      <FormControl>
                        <Textarea value={field.value || ""} onChange={field.onChange} placeholder="Enter goals" data-testid="input-goals" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievements</FormLabel>
                      <FormControl>
                        <Textarea value={field.value || ""} onChange={field.onChange} placeholder="Enter achievements" data-testid="input-achievements" />
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
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-performance">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingPerformance ? "Update" : "Create"}
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
            placeholder="Search performance reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-performance"
          />
        </div>
      </div>

      <DataTable
        data={filteredPerformances}
        columns={columns}
        onRowClick={() => {}}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}
