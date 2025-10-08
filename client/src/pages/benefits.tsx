import { useState } from "react";
import { DataTable, Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Heart, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// todo: remove mock functionality
interface EmployeeBenefit {
  id: string;
  employeeName: string;
  healthInsurance: string;
  retirementPlan: string;
  lifeInsurance: string;
  totalValue: string;
  status: "active" | "pending";
}

const mockBenefits: EmployeeBenefit[] = [
  { id: "1", employeeName: "John Doe", healthInsurance: "Premium Plan", retirementPlan: "401(k) - 6%", lifeInsurance: "$500,000", totalValue: "$8,500", status: "active" },
  { id: "2", employeeName: "Jane Smith", healthInsurance: "Premium Plan", retirementPlan: "401(k) - 8%", lifeInsurance: "$750,000", totalValue: "$10,200", status: "active" },
  { id: "3", employeeName: "Mike Johnson", healthInsurance: "Standard Plan", retirementPlan: "401(k) - 5%", lifeInsurance: "$400,000", totalValue: "$6,800", status: "active" },
  { id: "4", employeeName: "Sarah Williams", healthInsurance: "Premium Plus", retirementPlan: "401(k) - 10%", lifeInsurance: "$1,000,000", totalValue: "$12,500", status: "active" },
];

const benefitPlans = [
  { name: "Health Insurance", enrolled: 42, coverage: "Medical, Dental, Vision", icon: Heart, color: "text-chart-2" },
  { name: "Retirement Plans", enrolled: 38, coverage: "401(k) Matching", icon: Shield, color: "text-chart-1" },
  { name: "Life Insurance", enrolled: 45, coverage: "Term Life Coverage", icon: Shield, color: "text-chart-3" },
];

export default function Benefits() {
  const [searchQuery, setSearchQuery] = useState("");

  const columns: Column<EmployeeBenefit>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {row.employeeName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.employeeName}</span>
        </div>
      ),
    },
    {
      header: "Health Insurance",
      accessor: (row) => (
        <Badge variant="secondary" className="font-normal" data-testid={`badge-health-insurance-${row.id}`}>
          {row.healthInsurance}
        </Badge>
      ),
    },
    { header: "Retirement Plan", accessor: "retirementPlan" },
    { header: "Life Insurance", accessor: "lifeInsurance" },
    { header: "Total Value/Year", accessor: "totalValue", className: "font-semibold" },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant="outline" className={row.status === "active" ? "bg-chart-2/20 text-chart-2 border-chart-2/30" : "bg-chart-4/20 text-chart-4 border-chart-4/30"}>
          {row.status === "active" ? "Active" : "Pending"}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (benefit: EmployeeBenefit) => {
    console.log("Opening benefit details:", benefit.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Benefits Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee benefits and insurance plans
          </p>
        </div>
        <Button data-testid="button-enroll-benefits">
          <Plus className="h-4 w-4 mr-2" />
          Enroll Employee
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {benefitPlans.map((plan, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
              <plan.icon className={`h-4 w-4 ${plan.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plan.enrolled}</div>
              <p className="text-xs text-muted-foreground mt-1">Employees enrolled</p>
              <p className="text-xs text-muted-foreground mt-2">{plan.coverage}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee benefits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-benefits"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-plan">
          Filter by Plan
        </Button>
      </div>

      <DataTable
        data={mockBenefits}
        columns={columns}
        onRowClick={handleRowClick}
        currentPage={1}
        totalPages={2}
        onPageChange={(page) => console.log("Navigate to page:", page)}
      />
    </div>
  );
}
