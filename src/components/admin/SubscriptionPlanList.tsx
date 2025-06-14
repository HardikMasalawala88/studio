
"use client";

import type { SubscriptionPlan } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { getSubscriptionPlans } from "@/lib/userService";
import { Button } from "@/components/ui/button";
import { Edit, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlanForm } from "./SubscriptionPlanForm";
import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionPlanList() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | undefined>(undefined);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const fetchedPlans = await getSubscriptionPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load subscription plans.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);
  
  const handleOpenForm = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingPlan(undefined);
    setIsFormOpen(false);
  };

  const handlePlanSaved = (savedPlan: SubscriptionPlan) => {
    setPlans(prev => prev.map(p => p.id === savedPlan.id ? savedPlan : p));
    fetchPlans(); // Re-fetch to ensure data consistency if other admins are editing
  };
  
  if (loading) {
     return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4 mb-4" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plans.length === 0 && !loading ? (
         <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Subscription Plans Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no subscription plans configured in the system. This might indicate an issue.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price (INR)</TableHead>
                <TableHead>Duration (Months)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell>₹{plan.priceINR}</TableCell>
                  <TableCell>{plan.durationMonths}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isTrial ? "secondary" : "default"}>
                      {plan.isTrial ? 'Trial' : 'Paid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Edit Plan" onClick={() => handleOpenForm(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <SubscriptionPlanForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        initialData={editingPlan}
        onPlanSaved={handlePlanSaved}
      />
    </div>
  );
}
