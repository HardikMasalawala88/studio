"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import type { Case, CaseDocument, ClientData } from "@/lib/model";
import ApiService from "@/api/apiService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ClientForm } from "@/components/clients/ClientForm";
import CaseStatusAutocomplete from "./CaseStatusAutocomplete";
import OppositeAdvocateAutocomplete from "./OppositeAdvocateAutocomplete";

const formSchema = z.object({
  id: z.string().optional(),
  caseTitle: z
    .string()
    .max(20, { message: "Case title must be maximum 20 characters." }),

  caseDetail: z
    .string()
    .min(10, { message: "Case description must be at least 10 characters." }),
  caseNumber: z.string().min(1, { message: "Case number is required." }),
  hearingDate: z.date({
    required_error: "Hearing date is required.",
  }),
  filingDate: z.date({
    required_error: "Filing date is required.",
  }),
  caseStatus: z.string().min(1, { message: "Please select or enter case status." }),
  advocateId: z.string().optional(),
  clientId: z.string().min(1, { message: "Client is required." }),
  courtLocation: z.string().min(1, { message: "Court location is required." }),
  caseParentId: z.string().optional(),
  opponant: z.string().min(1, { message: "Opponant name is required." }),
  oppositeAdvocate: z.string().min(1, { message: "Opposite Advoacte is required." }),
  caseRemark: z.string().optional(),
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [clients, setClients] = useState<UserSelectItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<CaseDocument[]>(
    initialData?.caseDocuments ?? []
  );
  const [parentCases, setParentCases] = useState<
    { id: string; title: string }[]
  >([]);
  const [advocates, setAdvocates] = useState<UserSelectItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | undefined>(undefined);
  const [statuses, setStatuses] = useState<string[]>([...ALL_CASE_STATUSES]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


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
        opponant: initialData.opponant,
        oppositeAdvocate: initialData.oppositeAdvocate,
        caseRemark: initialData.caseRemark,
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
        opponant: "",
        oppositeAdvocate: "",
        caseRemark: "",
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
          (c) => c.user.createdBy === user?.email && c.user.isActive === true
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
              title: `${c.caseNumber} - ${c.caseTitle}`,
            }));

          setParentCases(advocateCases);
        }

        const allUsersRes = await ApiService.listAdvocates(); // assuming this gives all users
        const advocateList = Array.isArray(allUsersRes.data) ? allUsersRes.data : [];

        const otherAdvocates = advocateList
          .filter(
            (a: any) =>
              a.role === USER_ROLES.ADVOCATE &&
              a.uid !== user?.uid &&
              a.isActive
          )
          .map((a: any) => ({
            id: a.uid,
            name: a.email ?? "Unnamed Advocate",
          }));

        setAdvocates(otherAdvocates);

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
      hearingDate: new Date(initialData?.hearingDate ?? new Date()),
      filingDate: new Date(initialData?.filingDate ?? new Date()),
      courtLocation: initialData?.courtLocation ?? "",
      caseParentId: initialData?.caseParentId ?? "",
      caseStatus:
        (initialData?.caseStatus as CaseStatus) ?? ALL_CASE_STATUSES[0],
      advocateId: initialData?.advocateId ?? "",
      clientId: initialData?.clientId ?? "",
      opponant: initialData?.opponant ?? "",
      oppositeAdvocate: initialData?.oppositeAdvocate ?? "",
      caseRemark: initialData?.caseRemark ?? "",
      caseDocuments: initialData?.caseDocuments ?? [],
      hearingHistory: initialData?.hearingHistory ?? [],
      notes: initialData?.notes ?? [],
    });
  }, [form, user, initialData, toast]);


  const handleOpenForm = (client?: ClientData) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingClient(undefined);
    setIsFormOpen(false);
  };

  const handleClientSaved = async (savedClient: ClientData) => {
    // Reload clients after saving
    try {
      const clientRes = await ApiService.listClients();
      const clientList = Array.isArray(clientRes.data)
        ? clientRes.data
        : Array.isArray(clientRes)
          ? clientRes
          : [];

      const filteredClients = clientList.filter(
        (c) => c.user.createdBy === user?.email && c.user.isActive === true
      );

      const mappedClients = filteredClients.map((c: any) => ({
        id: c.id ?? c.uid ?? "",
        name: c.user.email ?? "Unnamed Client",
      }));

      setClients(mappedClients);

      // Automatically select the newly created client
      if (savedClient?.id) {
        form.setValue("clientId", savedClient.id);
      }
    } catch (err) {
      console.error("Failed to reload clients after saving", err);
    }

    handleCloseForm();
  };

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
          createdAt: response?.createdAt ?? new Date(),
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

  function toUtcMidnight(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
      hearingDate: toUtcMidnight(values.hearingDate),
      filingDate: toUtcMidnight(values.filingDate),
      courtLocation: values.courtLocation,
      caseParentId: values.caseParentId || "",
      caseStatus: values.caseStatus,
      advocateId: user?.uid,
      clientId: values.clientId,
      opponant: values.opponant,
      oppositeAdvocate: values.oppositeAdvocate,
      caseRemark: values.caseRemark,
      createdBy: initialData ? initialData.createdBy : user?.email,
      modifiedBy: initialData?.createdBy,
      createdAt: initialData?.createdAt ?? new Date(),
      modifiedAt: initialData?.modifiedAt ?? new Date(),
      ...(newUploadedDocs.length > 0 && {
        caseDocuments: [
          ...(initialData?.caseDocuments ?? []),
          ...newUploadedDocs,
        ],
      }),
      hearingHistory: initialData?.hearingHistory ?? [
        {
          hearingDate: values.hearingDate,
          note: "Initial hearing scheduled",
          updatedBy: user?.email ?? "",
          createdAt: new Date(),
        },
      ],
      notes: initialData?.notes ?? [],
    };

    try {
      if (initialData) {
        setIsEditMode(true);
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
        onSubmit={form.handleSubmit(onSubmit, (errors) => { })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="caseTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Title*</FormLabel>
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
              <FormLabel>Case Description*</FormLabel>
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
                <FormLabel>Case Number*</FormLabel>
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
                <FormLabel>Court Location*</FormLabel>
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
                        disabled={isLoading || isEditMode}
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
                        disabled={isLoading || isEditMode}
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

        {/* <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="caseStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Status*</FormLabel>
                <CaseStatusAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  options={statuses}
                  disabled={isLoading}
                />
                <FormMessage />
              </FormItem>
            )}
          /> */}

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
                <div className="relative">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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

                  {/* X Clear Button */}
                  {field.value && (
                    <button
                      type="button"
                      onClick={() => field.onChange("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800 hover:text-gray-800"
                    >
                      ×
                    </button>
                  )}
                </div>
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
                <FormLabel>Client*</FormLabel>
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
                    {clients.length > 0 ? (
                      <>
                        {clients.map((cli) => (
                          <SelectItem key={cli.id} value={cli.id}>
                            {cli.name}
                          </SelectItem>
                        ))}
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => handleOpenForm()}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            + Add Client
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground flex flex-col items-start gap-2">
                        <span>No client found</span>
                        <button
                          type="button"
                          onClick={() => handleOpenForm()}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          + Add Client
                        </button>
                      </div>
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
                    <div className="relative">
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        disabled={isLoading}
                        ref={fileInputRef}
                        className="pr-10" // Leave space for the ❌ button
                      />
                      {selectedFiles && selectedFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Selected but not yet uploaded */}
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="text-sm text-green-700">
                        <p className="font-medium">Documents Uploaded</p>
                        {/* <ul className="space-y-1">
                          {[...selectedFiles].map((file, index) => (
                            <li key={index} className="flex items-center justify-between bg-green-50 p-2 rounded shadow-sm">
                              <span className="italic text-green-900">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="ml-3 text-red-600 hover:text-red-800 font-bold"
                              >
                                ✖
                              </button>
                            </li>
                          ))}
                        </ul> */}
                      </div>
                    )}

                    {/* Already uploaded */}
                    {/* {uploadedFiles && uploadedFiles.length > 0 && (
                      <div className="text-sm text-green-700">
                        <p className="font-medium">Documents Uploaded</p>
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
                    )} */}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="opponant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opponent*</FormLabel>
                <FormControl>
                  <Input placeholder="Opponent name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="oppositeAdvocate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opposite Advocate*</FormLabel>
                <OppositeAdvocateAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  options={advocates.map((a) => a.name)} // assuming advocate list has `.name`
                  disabled={isLoading}
                />
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <FormField
          control={form.control}
          name="caseRemark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Remark</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Additional remarks"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


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
        {
          isFormOpen && (
            <ClientForm
              isOpen={isFormOpen}
              onClose={handleCloseForm}
              initialData={editingClient}
              onClientSaved={handleClientSaved}
            />
          )
        }

      </form>
    </Form>
  );

}
