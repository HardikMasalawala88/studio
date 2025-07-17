
// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { useEffect, useState } from "react";
// import { Loader2 } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import type { SubscriptionPlan } from "@/lib/types";
// import { updateSubscriptionPlan } from "@/lib/userService";
// import { useToast } from "@/hooks/use-toast";

// const formSchema = z.object({
//   name: z.string().min(3, { message: "Plan name must be at least 3 characters." }),
//   description: z.string().min(10, { message: "Description must be at least 10 characters." }),
//   priceINR: z.coerce.number().min(0, { message: "Price must be 0 or greater." }),
//   durationMonths: z.coerce.number().int().min(1, { message: "Duration must be at least 1 month." }),
// });

// interface SubscriptionPlanFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   initialData?: SubscriptionPlan;
//   onPlanSaved: (plan: SubscriptionPlan) => void;
// }

// export function SubscriptionPlanForm({ isOpen, onClose, initialData, onPlanSaved }: SubscriptionPlanFormProps) {
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);
  
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: initialData 
//       ? { 
//           name: initialData.name,
//           description: initialData.description,
//           priceINR: initialData.priceINR,
//           durationMonths: initialData.durationMonths,
//         }
//       : { // Should not happen as we only edit existing plans for now
//           name: "",
//           description: "",
//           priceINR: 0,
//           durationMonths: 1,
//         },
//   });
  
//   useEffect(() => {
//     if (isOpen && initialData) {
//       form.reset({
//         name: initialData.name,
//         description: initialData.description,
//         priceINR: initialData.priceINR,
//         durationMonths: initialData.durationMonths,
//       });
//     }
//   }, [isOpen, initialData, form]);


//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     if (!initialData) {
//       toast({ title: "Error", description: "No plan selected for editing.", variant: "destructive"});
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const updatedPlan = await updateSubscriptionPlan(initialData.id, values);
//       if (updatedPlan) {
//         toast({ title: "Plan Updated", description: `Subscription plan "${updatedPlan.name}" has been successfully updated.` });
//         onPlanSaved(updatedPlan);
//         onClose();
//       } else {
//         throw new Error("Failed to update plan at service level.");
//       }
//     } catch (error: any) {
//       toast({ title: "Error", description: error.message || "Failed to update subscription plan.", variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   const isTrialPlan = initialData?.isTrial === true;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle className="font-headline">Edit Subscription Plan</DialogTitle>
//           <DialogDescription>
//             Modify the details for the plan: <span className="font-semibold">{initialData?.name}</span>.
//             {isTrialPlan && " Price and duration for trial plans cannot be changed."}
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Plan Name</FormLabel>
//                   <FormControl><Input placeholder="e.g., Gold Plan" {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl><Textarea placeholder="Describe the plan benefits..." {...field} rows={3} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="priceINR"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Price (INR)</FormLabel>
//                   <FormControl><Input type="number" placeholder="e.g., 500" {...field} disabled={isTrialPlan} /></FormControl>
//                   {isTrialPlan && <FormDescription>Price for trial plans is fixed at 0.</FormDescription>}
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="durationMonths"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Duration (Months)</FormLabel>
//                   <FormControl><Input type="number" placeholder="e.g., 6" {...field} disabled={isTrialPlan} /></FormControl>
//                   {isTrialPlan && <FormDescription>Duration for trial plans is fixed.</FormDescription>}
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <DialogFooter className="pt-4">
//                 <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
//                     Cancel
//                 </Button>
//                 <Button type="submit" disabled={isLoading}>
//                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Save Changes
//                 </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import type { SubscriptionPackage } from "@/lib/model";
import ApiService from "@/api/apiService";

const formSchema = z.object({
  name: z.string().min(3, { message: "Plan name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  packagePrice: z.coerce.number().min(0, { message: "Price must be 0 or greater." }),
  durationMonth: z.coerce.number().int().min(1, { message: "Duration must be at least 1 month." }),
});

interface SubscriptionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SubscriptionPackage;
  onPlanSaved: () => void;
}

export function SubscriptionPlanForm({ isOpen, onClose, initialData, onPlanSaved }: SubscriptionPlanFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          packagePrice: initialData.packagePrice,
          durationMonth: initialData.durationMonth,
        }
      : {
          name: "",
          description: "",
          packagePrice: 0,
          durationMonth: 1,
        },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        packagePrice: initialData.packagePrice,
        durationMonth: initialData.durationMonth,
      });
    }
  }, [isOpen, initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!initialData?.id) {
      toast({
        title: "Error",
        description: "No subscription plan selected for editing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...initialData,
        ...values,
      };

      const res = await ApiService.updateSubscriptionPackage(initialData.id, payload);

      toast({
        title: "Plan Updated",
        description: `Subscription plan "${res.data.name}" has been successfully updated.`,
      });

      onPlanSaved();
      onClose();
    } catch (error: any) {
      console.error("Update failed", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update the subscription plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isTrialPlan = initialData?.isTrial === true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Modify the details for the plan: <span className="font-semibold">{initialData?.name}</span>.
            {isTrialPlan && " Price and duration for trial plans cannot be changed."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Gold Plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the plan benefits..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packagePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 500" {...field} disabled={isTrialPlan} />
                  </FormControl>
                  {isTrialPlan && <FormDescription>Price for trial plans is fixed at 0.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 6" {...field} disabled={isTrialPlan} />
                  </FormControl>
                  {isTrialPlan && <FormDescription>Duration for trial plans is fixed.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
