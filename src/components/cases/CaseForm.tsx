
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ALL_CASE_STATUSES, USER_ROLES } from "@/lib/constants";
import type { Case, CaseFormValues } from "@/lib/types";
import { createCase, updateCase, getMockAdvocates, getMockClients } from "@/lib/caseService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  hearingDate: z.date({ required_error: "Hearing date is required." }),
  status: z.enum(ALL_CASE_STATUSES, { required_error: "Status is required." }),
  advocateId: z.string().min(1, { message: "Advocate is required." }),
  clientId: z.string().min(1, { message: "Client is required." }),
});

interface UserSelectItem {
  id: string;
  name: string;
}

interface CaseFormProps {
  initialData?: Case; // For editing
}

export function CaseForm({ initialData }: CaseFormProps) {
  const router = useRouter();
  const { user, isSubscriptionActive } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [advocates, setAdvocates] = useState<UserSelectItem[]>([]);
  const [clients, setClients] = useState<UserSelectItem[]>([]);

  const canSubmitForm = user?.role === USER_ROLES.SUPER_ADMIN || (user?.role === USER_ROLES.ADVOCATE && isSubscriptionActive);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      hearingDate: new Date(initialData.hearingDate), 
    } : {
      title: "",
      description: "",
      hearingDate: new Date(),
      status: ALL_CASE_STATUSES[0], 
      advocateId: user?.role === USER_ROLES.ADVOCATE ? user.uid : "",
      clientId: user?.role === USER_ROLES.CLIENT ? user.uid : "",
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      const fetchedAdvocates = await getMockAdvocates();
      const fetchedClients = await getMockClients();
      setAdvocates(fetchedAdvocates);
      setClients(fetchedClients);

      if (!initialData) {
        if (user?.role === USER_ROLES.ADVOCATE && !form.getValues("advocateId")) {
          form.setValue("advocateId", user.uid);
        }
        if (user?.role === USER_ROLES.CLIENT && !form.getValues("clientId")) {
          form.setValue("clientId", user.uid);
        }
      }
    }
    fetchUsers();
  }, [user, initialData, form]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!canSubmitForm && user.role === USER_ROLES.ADVOCATE) {
      toast({ title: "Action Denied", description: "Your current subscription does not allow creating or editing cases.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (initialData) {
        await updateCase(initialData.caseId, values, user);
        toast({ title: "Case Updated", description: "The case details have been successfully updated." });
        router.push(`/case/${initialData.caseId}`);
      } else {
        await createCase(values, values.advocateId, values.clientId, user);
        toast({ title: "Case Created", description: "The new case has been successfully created." });
        router.push('/cases');
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${initialData ? 'update' : 'create'} case.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {user?.role === USER_ROLES.ADVOCATE && !isSubscriptionActive && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription Required</AlertTitle>
          <AlertDescription>
            Your subscription is inactive. You cannot {initialData ? 'edit this' : 'create a new'} case. 
            Please <Link href="/subscription" className="font-medium underline">renew your subscription</Link>.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Personal Injury Claim - John Doe" {...field} disabled={!canSubmitForm} />
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
                <FormLabel>Case Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Provide a detailed description of the case..." {...field} rows={5} disabled={!canSubmitForm} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid md:grid-cols-2 gap-8">
              <FormField
              control={form.control}
              name="hearingDate"
              render={({ field }) => (
                  <FormItem className="flex flex-col">
                  <FormLabel>Next Hearing Date</FormLabel>
                  <Popover>
                      <PopoverTrigger asChild>
                      <FormControl>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                          )}
                          disabled={!canSubmitForm}
                          >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                      </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01") || !canSubmitForm}
                          initialFocus
                      />
                      </PopoverContent>
                  </Popover>
                  <FormMessage />
                  </FormItem>
              )}
              />
              <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Current Case Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canSubmitForm}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Select case status" />
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
          </div>
          <div className="grid md:grid-cols-2 gap-8">
              <FormField
                  control={form.control}
                  name="advocateId"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Advocate</FormLabel>
                      <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={user?.role === USER_ROLES.ADVOCATE || advocates.length === 0 || !canSubmitForm}
                      >
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select advocate" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {advocates.map(adv => (
                              <SelectItem key={adv.id} value={adv.id}>{adv.name}</SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      {user?.role === USER_ROLES.ADVOCATE && <FormDescription>You are assigned as the advocate.</FormDescription>}
                      <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={user?.role === USER_ROLES.CLIENT || clients.length === 0 || !canSubmitForm}
                      >
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {clients.map(cli => (
                              <SelectItem key={cli.id} value={cli.id}>{cli.name}</SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      {user?.role === USER_ROLES.CLIENT && <FormDescription>This case is for you.</FormDescription>}
                      <FormMessage />
                      </FormItem>
                  )}
              />
          </div>
          <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !canSubmitForm}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData ? 'Save Changes' : 'Create Case'}
              </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
