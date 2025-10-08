import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, UserPlus, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// todo: remove mock functionality
interface UserPermission {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Accountant" | "Sales";
  permissions: {
    invoices: boolean;
    proforma: boolean;
    customers: boolean;
    expenses: boolean;
    employees: boolean;
    salaries: boolean;
    stock: boolean;
    audit: boolean;
  };
}

const mockUsers: UserPermission[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@company.com",
    role: "Admin",
    permissions: { invoices: true, proforma: true, customers: true, expenses: true, employees: true, salaries: true, stock: true, audit: true },
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@company.com",
    role: "Manager",
    permissions: { invoices: true, proforma: true, customers: true, expenses: true, employees: true, salaries: false, stock: true, audit: true },
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@company.com",
    role: "Accountant",
    permissions: { invoices: true, proforma: true, customers: false, expenses: true, employees: false, salaries: true, stock: false, audit: false },
  },
];

const modules = [
  { key: "invoices", label: "Invoices" },
  { key: "proforma", label: "Proforma" },
  { key: "customers", label: "Customers" },
  { key: "expenses", label: "Expenses" },
  { key: "employees", label: "Employees" },
  { key: "salaries", label: "Salaries" },
  { key: "stock", label: "Stock" },
  { key: "audit", label: "Audit" },
];

export default function Permissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(mockUsers[0]);

  const handlePermissionToggle = (module: string, value: boolean) => {
    console.log(`Toggle ${module} permission to ${value} for user ${selectedUser?.name}`);
  };

  const roleColors: Record<UserPermission["role"], string> = {
    Admin: "bg-chart-1/20 text-chart-1 border-chart-1/30",
    Manager: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    Accountant: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    Sales: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground mt-1">
            Control user access to different modules
          </p>
        </div>
        <Button data-testid="button-add-user">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>
            <div className="space-y-2">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover-elevate ${
                    selectedUser?.id === user.id ? "bg-accent" : ""
                  }`}
                  data-testid={`user-item-${user.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="outline" className={roleColors[user.role]}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUser ? `Permissions for ${selectedUser.name}` : "Select a user"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Badge variant="outline" className={`ml-auto ${roleColors[selectedUser.role]}`}>
                    {selectedUser.role}
                  </Badge>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead className="text-right">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.map((module) => (
                        <TableRow key={module.key}>
                          <TableCell className="font-medium">{module.label}</TableCell>
                          <TableCell className="text-right">
                            <Switch
                              checked={selectedUser.permissions[module.key as keyof typeof selectedUser.permissions]}
                              onCheckedChange={(checked) => handlePermissionToggle(module.key, checked)}
                              data-testid={`switch-${module.key}`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button data-testid="button-save-permissions">
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Select a user to manage their permissions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
