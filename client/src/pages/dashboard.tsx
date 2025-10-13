import { StatsCard } from "@/components/stats-card";

import { Bell, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TestReminderButton } from "@/components/test-reminder-button";

// todo: remove mock functionality
const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
];

const expenseData = [
  { category: "Salaries", amount: 35000 },
  { category: "Operations", amount: 12000 },
  { category: "Marketing", amount: 8000 },
  { category: "Other", amount: 5000 },
];

const topCustomers = [
  { name: "Acme Corp", revenue: "$45,000", orders: 23 },
  { name: "TechStart Inc", revenue: "$38,500", orders: 18 },
  { name: "Global Solutions", revenue: "$32,000", orders: 15 },
  { name: "Innovation Labs", revenue: "$28,750", orders: 12 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Admin Test Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Reminder System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Manually trigger the payment reminder checker to send
                notifications for overdue invoices.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Normally runs automatically at 9 AM daily)
              </p>
            </div>
            <TestReminderButton />
          </div>
        </CardContent>
      </Card>

      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your business performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$328,000"
          trend={{ value: "+12.5%", isPositive: true }}
          icon={DollarSign}
          iconColor="text-chart-2"
        />
        <StatsCard
          title="Outstanding Invoices"
          value="$45,200"
          trend={{ value: "-8.3%", isPositive: true }}
          icon={FileText}
          iconColor="text-chart-4"
        />
        <StatsCard
          title="Stock Value"
          value="$125,500"
          trend={{ value: "+5.2%", isPositive: true }}
          icon={Package}
          iconColor="text-chart-3"
        />
        <StatsCard
          title="Active Employees"
          value="48"
          trend={{ value: "+4", isPositive: true }}
          icon={Users}
          iconColor="text-chart-1"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-1/20">
                  <FileText className="h-4 w-4 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New invoice created</p>
                  <p className="text-xs text-muted-foreground">
                    Invoice #INV-2024-001 for Acme Corp
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/20">
                  <DollarSign className="h-4 w-4 text-chart-2" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">
                    $12,500 from TechStart Inc
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-3/20">
                  <Package className="h-4 w-4 text-chart-3" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-muted-foreground">
                    Product XYZ-123 is running low
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 day ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-sm">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.orders} orders
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{customer.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
