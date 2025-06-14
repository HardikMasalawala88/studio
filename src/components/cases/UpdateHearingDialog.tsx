
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ALL_CASE_STATUSES, CASE_STATUSES } from "@/lib/constants";
import type { HearingUpdateFormValues, Case, AuthUser } from "@/lib/types";
import { recordHearingOutcomeAndSetNext } from "@/lib/caseService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  currentHearingStatus: z.enum(ALL_CASE_STATUSES, { required_error: "Status for today's hearing is required." }),
  currentHearingNotes: z.string().optional(),
  nextHearingDate: z.date().optional(),
  nextHearingStatus: z.enum(ALL_CASE_STATUSES).optional(),
}).superRefine((data, ctx) => {
  if (data.nextHearingDate && !data.nextHearingStatus) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Status for the next hearing is required if a date is set.",
      path: ["nextHearingStatus"],
    });
  }
  if (!data.nextHearingDate && data.nextHearingStatus && data.currentHearingStatus !== CASE_STATUSES.CLOSED && data.currentHearingStatus !== CASE_STATUSES.ON_HOLD) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Next hearing date is required if a next status is set and current hearing is not closing the case.",
      path: ["nextHearingDate"],
    });
  }
  if ((data.currentHearingStatus === CASE_STATUSES.CLOSED || data.currentHearingStatus === CASE_STATUSES.ON_HOLD) && (data.nextHearingDate || data.nextHearingStatus)) {
    // Allow closing/on-hold without next date/status, but if they are provided, it's okay.
    // However, if it's closed, a next hearing date doesn't make much sense.
    // Let's refine: if closed, no next date or status.
    if (data.currentHearingStatus === CASE_STATUSES.CLOSED && data.nextHearingDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot set a next hearing date if the case is being closed.",
          path: ["nextHearingDate"],
        });
    }
     if (data.currentHearingStatus === CASE_STATUSES.CLOSED && data.nextHearingStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot set a next hearing status if the case is being closed.",
          path: ["nextHearingStatus"],
        });
    }
  }
});


interface UpdateHearingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseToUpdate: Case;
  currentUser: AuthUser;
  onHearingUpdated: (updatedCase: Case) => void;
}

export function UpdateHearingDialog({ isOpen, onClose, caseToUpdate, currentUser, onHearingUpdated }: UpdateHearingDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentHearingStatus: caseToUpdate.status, // Default to current case status
      currentHearingNotes: "",
      nextHearingDate: undefined,
      nextHearingStatus: undefined,
    },
  });

  const currentHearingStatusWatcher = form.watch("currentHearingStatus");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const nextHearingDetails = (values.nextHearingDate && values.nextHearingStatus && currentHearingStatusWatcher !== CASE_STATUSES.CLOSED)
        ? { date: values.nextHearingDate, status: values.nextHearingStatus }
        : null;

      const updatedCase = await recordHearingOutcomeAndSetNext(
        caseToUpdate.caseId,
        new Date(caseToUpdate.hearingDate), // The actual date of the hearing being updated
        { status: values.currentHearingStatus, notes: values.currentHearingNotes },
        nextHearingDetails,
        currentUser
      );

      if (updatedCase) {
        toast({ title: "Hearing Updated", description: "The hearing outcome has been recorded and the case updated." });
        onHearingUpdated(updatedCase);
        onClose();
      } else {
        toast({ title: "Error", description: "Failed to update hearing.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Reset form when dialog opens/closes or caseToUpdate changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        currentHearingStatus: caseToUpdate.status !== CASE_STATUSES.CLOSED ? CASE_STATUSES.UPCOMING : CASE_STATUSES.CLOSED, // Sensible default for "today's" outcome
        currentHearingNotes: "",
        nextHearingDate: undefined,
        nextHearingStatus: undefined,
      });
    }
  }, [isOpen, caseToUpdate, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Hearing for: {caseToUpdate.title}</DialogTitle>
          <DialogDescription>
            Record outcome for hearing on {format(new Date(caseToUpdate.hearingDate), "PPP")} and set next steps.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
            <FormField
              control={form.control}
              name="currentHearingStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status of Today&apos;s Hearing</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_CASE_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentHearingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for Today&apos;s Hearing (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Arguments heard, adjourned for orders..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentHearingStatusWatcher !== CASE_STATUSES.CLOSED && (
              <>
                <FormField
                  control={form.control}
                  name="nextHearingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Hearing Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick next date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setDate(new Date(caseToUpdate.hearingDate).getDate()))} // Cannot be before current hearing
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("nextHearingDate") && (
                    <FormField
                    control={form.control}
                    name="nextHearingStatus"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status for Next Hearing</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status for next hearing" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {ALL_CASE_STATUSES.filter(s => s !== CASE_STATUSES.CLOSED).map(status => ( // Cannot pre-set next as Closed
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
              </>
            )}

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Hearing
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

