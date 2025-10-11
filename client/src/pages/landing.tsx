import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, FileText, Users, DollarSign, Package, Settings } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <Button onClick={() => window.location.href = "/api/login"} data-testid="button-login">
            Log In
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Comprehensive Business Management</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage invoices, customers, expenses, employees, and inventory all in one powerful admin dashboard
          </p>
          <Button size="lg" onClick={() => window.location.href = "/api/login"} data-testid="button-get-started">
            Get Started
          </Button>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <FileText className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Invoice Management</h4>
                <p className="text-sm text-muted-foreground">
                  Create, track, and manage sales invoices and proforma invoices with ease
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Customer & Employee Management</h4>
                <p className="text-sm text-muted-foreground">
                  Maintain complete records of customers and employees with detailed profiles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <DollarSign className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Expense & Salary Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor expenses and manage employee salaries efficiently
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Package className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Stock Management</h4>
                <p className="text-sm text-muted-foreground">
                  Track inventory levels, reorder points, and supplier information
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Visual Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Get insights with charts and reports for better decision making
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Settings className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-semibold mb-2">Customizable Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure tax rates, invoice notes, currency, and ID sequences
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Admin Panel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
