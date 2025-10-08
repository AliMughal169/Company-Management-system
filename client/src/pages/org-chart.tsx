import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone } from "lucide-react";

// todo: remove mock functionality
interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  reports: number;
  level: number;
}

const orgData: OrgNode[] = [
  { id: "1", name: "Sarah Williams", role: "CEO", department: "Executive", email: "sarah@company.com", phone: "+1 234-567-8900", reports: 4, level: 0 },
  { id: "2", name: "John Doe", role: "Sales Director", department: "Sales", email: "john@company.com", phone: "+1 234-567-8901", reports: 8, level: 1 },
  { id: "3", name: "Jane Smith", role: "Marketing Director", department: "Marketing", email: "jane@company.com", phone: "+1 234-567-8902", reports: 6, level: 1 },
  { id: "4", name: "Mike Johnson", role: "Tech Director", department: "IT", email: "mike@company.com", phone: "+1 234-567-8903", reports: 12, level: 1 },
  { id: "5", name: "Tom Brown", role: "Operations Director", department: "Operations", email: "tom@company.com", phone: "+1 234-567-8904", reports: 10, level: 1 },
];

const departments = [
  { name: "Sales", headCount: 8, head: "John Doe", color: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
  { name: "Marketing", headCount: 6, head: "Jane Smith", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  { name: "IT", headCount: 12, head: "Mike Johnson", color: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  { name: "Operations", headCount: 10, head: "Tom Brown", color: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
  { name: "HR", headCount: 4, head: "Sarah Williams", color: "bg-chart-5/20 text-chart-5 border-chart-5/30" },
];

export default function OrgChart() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Organization Chart</h1>
          <p className="text-muted-foreground mt-1">
            View company structure and department hierarchy
          </p>
        </div>
        <Button data-testid="button-edit-structure">
          Edit Structure
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {departments.map((dept, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <Badge variant="outline" className={dept.color} data-testid={`badge-dept-${dept.name.toLowerCase()}`}>
                  {dept.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold" data-testid={`text-dept-${dept.name.toLowerCase()}-headcount`}>{dept.headCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Head: {dept.head}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leadership Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orgData.map((member) => (
              <Card key={member.id} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/20 text-primary text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <Badge variant="secondary">{member.department}</Badge>
                      </div>
                      <div className="grid gap-2 mt-4 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                      {member.reports > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {member.reports} direct reports
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
