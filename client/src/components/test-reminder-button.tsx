import { Bell, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {User} from "@shared/schema";
export function TestReminderButton() {
  const { toast } = useToast();
  const { user } = useAuth();

  const userData=user as User;
  const checkRemindersMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/check-reminders", "POST");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Reminder check completed",
        description: `${data.results?.length || 0} reminder(s) sent`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check reminders",
        variant: "destructive",
      });
    },
  });

  // Only show for admin users
  if (!userData || userData.role !== "admin") {
    return null;
  }

  return (
    <Button
      onClick={() => checkRemindersMutation.mutate()}
      disabled={checkRemindersMutation.isPending}
      data-testid="button-check-reminders"
    >
      {checkRemindersMutation.isPending ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Checking...
        </>
      ) : (
        <>
          <Bell className="mr-2 h-4 w-4" />
          Check Reminders Now
        </>
      )}
    </Button>
  );
}