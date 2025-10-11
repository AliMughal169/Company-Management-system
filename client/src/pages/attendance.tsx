import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { insertAttendanceSchema, type Attendance, type Employee, type InsertAttendance } from "@shared/schema";
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

const STATUSES = ["present", "absent", "late", "half_day"];

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const { toast } = useToast();

  const { data: attendances = [], isLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<InsertAttendance>({
    resolver: zodResolver(insertAttendanceSchema),
    defaultValues: {
      employeeId: 0,
      date: "",
      checkIn: "",
      checkOut: "",
      workHours: "",
      overtime: "0h",
      status: "present",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertAttendance) => apiRequest("/api/attendance", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Attendance created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating attendance", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertAttendance> }) =>
      apiRequest(`/api/attendance/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setIsDialogOpen(false);
      setEditingAttendance(null);
      form.reset();
      toast({ title: "Attendance updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating attendance", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/attendance/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({ title: "Attendance deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting attendance", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertAttendance) => {
    if (editingAttendance) {
      updateMutation.mutate({ id: editingAttendance.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    form.reset({
      employeeId: attendance.employeeId,
      date: attendance.date,
      checkIn: attendance.checkIn || "",
      checkOut: attendance.checkOut || "",
      workHours: attendance.workHours || "",
      overtime: attendance.overtime || "0h",
      status: attendance.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingAttendance(null);
      form.reset();
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  const filteredAttendances = attendances.filter((attendance) => {
    const employeeName = getEmployeeName(attendance.employeeId);
    return employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendance.date.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      half_day: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const columns: Column<Attendance>[] = [
    {
      header: "Employee",
      accessor: (row) => getEmployeeName(row.employeeId),
      className: "font-medium",
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Check In",
      accessor: (row) => row.checkIn || "N/A",
    },
    {
      header: "Check Out",
      accessor: (row) => row.checkOut || "N/A",
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status),
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
            data-testid={`button-edit-attendance-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-delete-attendance-${row.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Attendance?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this attendance record. This action cannot be undone.
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
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee attendance records
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-attendance">
              <Plus className="h-4 w-4 mr-2" />
              Add Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAttendance ? "Edit Attendance" : "Add New Attendance"}</DialogTitle>
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
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check In</FormLabel>
                        <FormControl>
                          <Input type="time" value={field.value || ""} onChange={field.onChange} data-testid="input-check-in" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Out</FormLabel>
                        <FormControl>
                          <Input type="time" value={field.value || ""} onChange={field.onChange} data-testid="input-check-out" />
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
                                {status.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-attendance">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingAttendance ? "Update" : "Create"}
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
            placeholder="Search attendance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-attendance"
          />
        </div>
      </div>

      <DataTable
        data={filteredAttendances}
        columns={columns}
        onRowClick={() => {}}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}
