"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import {
  ALL_CASE_STATUSES,
  CASE_STATUSES,
  USER_ROLES,
  type CaseStatus,
} from "@/lib/constants";
import type { Case, CaseDocument } from "@/lib/model";
import ApiService from "@/api/apiService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  id: z.string().optional(),
  caseTitle: z.string().min(5),
  caseDetail: z.string().min(10),
  caseNumber: z.string().min(1),
  hearingDate: z.date(),
  filingDate: z.date(),
  caseStatus: z.enum(ALL_CASE_STATUSES),
  advocateId: z.string().optional(),
  clientId: z.string().min(1),
  courtLocation: z.string().min(1),
  caseParentId: z.string().optional(),
  caseDocuments: z.array(z.any()).optional().default([]),
  hearingHistory: z.array(z.any()).optional().default([]),
  notes: z.array(z.any()).optional().default([]),
});

interface UserSelectItem {
  id: string;
  name: string;
}

interface CaseFormProps {
  initialData?: Case;
}

export function CaseForm({ initialData }: CaseFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<UserSelectItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<CaseDocument[]>(
    initialData?.caseDocuments ?? []
  );
  const [parentCases, setParentCases] = useState<
    { id: string; title: string }[]
  >([]);

  // ✅ Infer type from schema
  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          caseTitle: initialData.caseTitle,
          caseDetail: initialData.caseDetail,
          caseNumber: initialData.caseNumber,
          hearingDate: initialData.hearingDate,
          filingDate: initialData.filingDate,
          courtLocation: initialData.courtLocation,
          caseParentId: initialData.caseParentId ?? "",
          caseStatus: initialData.caseStatus as CaseStatus,
          advocateId: initialData.advocateId,
          clientId: initialData.clientId,
          caseDocuments: initialData.caseDocuments,
          hearingHistory: initialData.hearingHistory,
          notes: initialData.notes,
        }
      : {
          caseTitle: "",
          caseDetail: "",
          caseNumber: "",
          hearingDate: new Date(),
          filingDate: new Date(),
          courtLocation: "",
          caseParentId: "",
          caseStatus: ALL_CASE_STATUSES[0],
          advocateId: user?.role === USER_ROLES.ADVOCATE ? user.uid : "",
          clientId: user?.role === USER_ROLES.CLIENT ? user.uid : "",
          caseDocuments: [],
          hearingHistory: [],
          notes: [],
        },
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const clientRes = await ApiService.listClients();

        const clientList = Array.isArray(clientRes.data)
          ? clientRes.data
          : Array.isArray(clientRes)
          ? clientRes
          : [];

        const filteredClients = clientList.filter(
          (c) => c.user.createdBy === user?.email
        );

        const mappedClients = filteredClients.map((c: any) => ({
          id: c.id ?? c.uid ?? "",
          name: c.user.email ?? "Unnamed Client",
        }));

        setClients(mappedClients);

        if (user?.role === USER_ROLES.ADVOCATE) {
          const caseListRes = await ApiService.listCases(); // Fetch all cases
          const allCases = Array.isArray(caseListRes.data)
            ? caseListRes.data
            : [];

          const advocateCases = allCases
            .filter((c: any) => c.advocateId === user.uid)
            .map((c: any) => ({
              id: c.id ?? "",
              title: `${c.CaseNumber} - ${c.CaseTitle}`,
            }));

          setParentCases(advocateCases);
        }

        if (!initialData) {
          if (user?.role === USER_ROLES.CLIENT) {
            form.setValue("clientId", user.uid);
          }
        }
      } catch (error: any) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load users.",
          variant: "destructive",
        });
      }
    }
    fetchUsers();
    form.reset({
      caseTitle: initialData?.caseTitle ?? "",
      caseDetail: initialData?.caseDetail ?? "",
      caseNumber: initialData?.caseNumber ?? "",
      hearingDate: initialData?.hearingDate
        ? new Date(initialData.hearingDate)
        : new Date(),
      filingDate: initialData?.filingDate
        ? new Date(initialData.filingDate)
        : new Date(),
      courtLocation: initialData?.courtLocation ?? "",
      caseParentId: initialData?.caseParentId ?? "",
      caseStatus:
        (initialData?.caseStatus as CaseStatus) ?? ALL_CASE_STATUSES[0],
      advocateId: initialData?.advocateId ?? "",
      clientId: initialData?.clientId ?? "",
      caseDocuments: initialData?.caseDocuments ?? [],
      hearingHistory: initialData?.hearingHistory ?? [],
      notes: initialData?.notes ?? [],
    });
  }, [form, user, initialData, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const existingFileNames = uploadedFiles.map((f) => f.fileName);
    const filtered = Array.from(files).filter(
      (file) => !existingFileNames.includes(file.name)
    );

    setSelectedFiles(filtered.length > 0 ? (filtered as any) : null);
  };

  async function uploadFiles(files: FileList): Promise<CaseDocument[]> {
    const uploaded: CaseDocument[] = [];
    if (!initialData?.id) return uploaded;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        let response;

        response = await ApiService.uploadDocument(initialData.id, formData);
        // const uploadedDoc = response.document;

        uploaded.push({
          url: response?.url ?? "",
          fileName: response?.fileName ?? file.name,
          type: response?.type ?? file.type,
          createdAt: response?.createdAt ?? new Date().toISOString(),
        });
      } catch (error: any) {
        console.error(`Error uploading file ${file.name}:`, error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    return uploaded;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let newUploadedDocs: CaseDocument[] = [];
    // Upload only if user selected new files
    if (selectedFiles && selectedFiles.length > 0) {
      newUploadedDocs = await uploadFiles(selectedFiles); // will update Case + CaseDocument tables
    }

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : { id: "" }),
      caseTitle: values.caseTitle,
      caseDetail: values.caseDetail,
      caseNumber: values.caseNumber,
      hearingDate: values.hearingDate.toISOString(),
      filingDate: values.filingDate.toISOString(),
      courtLocation: values.courtLocation,
      caseParentId: values.caseParentId || "",
      caseStatus: values.caseStatus,
      advocateId: user?.uid,
      clientId: values.clientId,
      createdBy: initialData ? initialData.createdBy : user?.email,
      modifiedBy: initialData?.createdBy,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      modifiedAt: initialData?.modifiedAt ?? new Date().toISOString(),
      ...(newUploadedDocs.length > 0 && {
        caseDocuments: [
          ...(initialData?.caseDocuments ?? []),
          ...newUploadedDocs,
        ],
      }),
      hearingHistory: initialData?.hearingHistory ?? [
        {
          hearingDate: values.hearingDate.toISOString(),
          note: "Initial hearing scheduled",
          updatedBy: user?.email ?? "",
          createdAt: new Date().toISOString(),
        },
      ],
      notes: initialData?.notes ?? [],
    };

    try {
      if (initialData) {
        await ApiService.updateCase(initialData.id, payload);
        toast({
          title: "Case Updated",
          description: "Successfully saved changes.",
        });
        router.push(`/cases`);
      } else {
        await ApiService.addCase(payload);
        toast({
          title: "Case Created",
          description: "Successfully created new case.",
        });
        router.push("/cases");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${initialData ? "update" : "create"} case.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {})}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="caseTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Contract Dispute"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caseDetail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Brief details of the case"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="caseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. C1234"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courtLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Court Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Mumbai District Court"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="hearingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hearing Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
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
            name="filingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Filing Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="caseStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALL_CASE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caseParentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Case</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={parentCases.length === 0 || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="--Select parent case(optional)--" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentCases.length === 0 ? (
                      <div className="p-2 text-muted-foreground text-sm">
                        No cases found
                      </div>
                    ) : (
                      parentCases.map((pcase) => (
                        <SelectItem key={pcase.id} value={pcase.id}>
                          {pcase.title}
                        </SelectItem>
                      ))
                    )}
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
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={user?.role === USER_ROLES.CLIENT || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="--Select client--" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No client found
                      </div>
                    ) : (
                      clients.map((cli) => (
                        <SelectItem key={cli.id} value={cli.id}>
                          {cli.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caseDocuments"
            render={() => (
              <FormItem>
                <FormLabel>Case Document</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {/* File input */}
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />

                    {/* Selected but not yet uploaded */}
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium">
                          New files selected (not uploaded yet):
                        </p>
                        <ul className="list-disc ml-5">
                          {[...selectedFiles].map((file, index) => (
                            <li key={index} className="italic">
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Already uploaded */}
                    {uploadedFiles && uploadedFiles.length > 0 && (
                      <div className="text-sm text-green-700">
                        <p className="font-medium">Uploaded Documents:</p>
                        <ul className="list-disc ml-5">
                          {uploadedFiles.map((file, index) => (
                            <li key={index}>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-blue-600"
                              >
                                {file.fileName}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit">
            {/* disabled={isLoading} */}
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Case"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
