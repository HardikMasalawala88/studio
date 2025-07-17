"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ALL_CASE_STATUSES, CASE_STATUSES } from "@/lib/constants";
import type { AuthUser } from "@/lib/model";
import type { Case, HearingEntry } from "@/lib/model";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/api/apiService";

const formSchema = z
  .object({
    currentHearingNotes: z.string().optional(),
    nextHearingDate: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.currentHearingNotes && !data.nextHearingDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add a note or set a next hearing date.",
      });
    }
  });

interface UpdateHearingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseToUpdate: Case;
  currentUser: AuthUser;
  onHearingUpdated: (updatedCase: Case) => void;
}

export function UpdateHearingDialog({
  isOpen,
  onClose,
  caseToUpdate,
  currentUser,
  onHearingUpdated,
}: UpdateHearingDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentHearingNotes: "",
      nextHearingDate: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let updatedHearingHistory;

      const selectedDate = values.nextHearingDate
        ? new Date(
            values.nextHearingDate.getFullYear(),
            values.nextHearingDate.getMonth(),
            values.nextHearingDate.getDate(),
            12,
            0,
            0 // Set to 12:00 PM to avoid timezone shift
          )
        : caseToUpdate.hearingDate;
      const payload: HearingEntry = {
        hearingDate: selectedDate,
        note: values.currentHearingNotes || "",
        updatedBy: currentUser.email,
      };

      // Call the API once and get the updated hearingHistory array
      updatedHearingHistory = await ApiService.updateHearing(
        caseToUpdate.id,
        payload
      );

      toast({
        title: "Hearing Updated",
        description: "The hearing has been updated successfully.",
      });

      // Create the updated case object using the returned hearing history
      const updatedCase: Case = {
        ...caseToUpdate,
        hearingDate: new Date(payload.hearingDate as string | Date),
        hearingHistory: updatedHearingHistory,
      };

      // Notify parent component and close the dialog
      onHearingUpdated(updatedCase);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update hearing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      form.reset({
        currentHearingNotes: "",
        nextHearingDate: undefined,
      });
    }
  }, [isOpen, caseToUpdate, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Update Hearing for: {caseToUpdate.caseTitle}
          </DialogTitle>
          <DialogDescription>
            Record outcome for hearing on{" "}
            {format(new Date(caseToUpdate.hearingDate), "PPP")} and set next
            steps.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <FormField
              control={form.control}
              name="currentHearingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for Today's Hearing (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Arguments heard, adjourned for orders..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick next date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(caseToUpdate.hearingDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
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
