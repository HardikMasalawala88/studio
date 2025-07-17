"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/api/apiService";
import { Skeleton } from "@/components/ui/skeleton";

const paymentGateways = ["PhonePe", "Razorpay"]; // Can extend later

export default function PaymentGatewaySettings() {
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGateway = async () => {
      try {
        const res = await ApiService.getSelectedGateway();
        setSelectedGateway(res.data.gateway);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load current gateway.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchGateway();
  }, []);

  const handleChange = async (value: string) => {
    setSelectedGateway(value);
    try {
      await ApiService.updatePaymentGateway({ gateway: value });
      toast({ title: "Success", description: "Payment gateway updated." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update gateway.", variant: "destructive" });
    }
  };

  if (loading) return <Skeleton className="h-10 w-1/3" />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Payment Gateway</h2>
      <p className="text-muted-foreground text-sm">Choose the default payment gateway used for all subscriptions.</p>
      <div className="max-w-sm">
        <Select value={selectedGateway || undefined} onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Gateway" />
          </SelectTrigger>
          <SelectContent>
            {paymentGateways.map((gateway) => (
              <SelectItem key={gateway} value={gateway}>
                {gateway}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
