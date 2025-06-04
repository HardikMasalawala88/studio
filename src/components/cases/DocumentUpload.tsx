"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Paperclip, XCircle, Loader2 } from "lucide-react";
import type { CaseDocument } from "@/lib/types";
import { addDocumentToCase } from "@/lib/caseService"; // Mock service

interface DocumentUploadProps {
  caseId: string;
  onDocumentUploaded: (document: CaseDocument) => void;
}

export function DocumentUpload({ caseId, onDocumentUploaded }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Limit file types (example)
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, DOCX, JPG, or PNG files.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset input
        return;
      }
      // Limit file size (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
         toast({
          title: "File Too Large",
          description: "File size should not exceed 5MB.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset input
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "No File Selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    // Simulate upload process (replace with actual Firebase Storage upload)
    try {
      // In a real app, you'd upload to Firebase Storage and get a URL.
      // For now, we use the mock service.
      const newDocument = await addDocumentToCase(caseId, { name: selectedFile.name, url: "#" }); // URL would come from storage
      if (newDocument) {
        onDocumentUploaded(newDocument);
        toast({ title: "Upload Successful", description: `Document "${selectedFile.name}" uploaded.` });
        setSelectedFile(null);
        // Reset the file input if possible (might need a ref or key change)
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = "";

      } else {
        throw new Error("Upload failed at service level.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: "Could not upload the document.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h4 className="text-lg font-semibold">Upload Document</h4>
      <div className="flex items-center space-x-2">
        <Input id="file-upload-input" type="file" onChange={handleFileChange} className="flex-grow" disabled={isUploading} accept=".pdf,.docx,.jpg,.jpeg,.png"/>
      </div>
      {selectedFile && (
        <div className="mt-2 flex items-center justify-between text-sm p-2 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} disabled={isUploading}>
            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
      <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full sm:w-auto">
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        Upload File
      </Button>
      <p className="text-xs text-muted-foreground">Allowed types: PDF, DOCX, JPG, PNG. Max size: 5MB.</p>
    </div>
  );
}
