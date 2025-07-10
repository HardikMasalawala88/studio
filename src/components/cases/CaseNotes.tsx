"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/lib/model";
// import { addNoteToCase } from "@/lib/caseService";
import { useAuth } from "@/context/AuthContext";
import {
  summarizeCaseNotes,
  type SummarizeCaseNotesInput,
} from "@/ai/flows/summarize-case-notes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Bot,
  MessageSquare,
  UserCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ApiService from "@/api/apiService";

interface CaseNotesProps {
  caseId: string;
  initialNotes: Note[];
  onNoteAdded: (note: Note) => void;
}

export function CaseNotes({
  caseId,
  initialNotes,
  onNoteAdded,
}: CaseNotesProps) {
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      // let createdNote;
      const payload: Note = {
        description: newNote,
        createdAt: new Date(),
      };
      await ApiService.addNote(caseId, payload);
      const createdNote: Note = {
        description: newNote,
        createdAt: payload.createdAt,
      };
      console.log("createdNote from API", createdNote);

      if (createdNote) {
        onNoteAdded(createdNote); // still useful if parent wants to know
        setNotes((prev) => [...prev, createdNote]); // ✅ update local display
        setNewNote("");
        toast({
          title: "Note Added",
          description: "Your note has been successfully added.",
        });
      } else {
        throw new Error("Failed to add note at service level.");
      }
    } catch (error) {
      toast({
        title: "Error Adding Note",
        description: "Could not save your note.",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSummarizeNotes = async () => {
    if (initialNotes.length === 0) {
      toast({
        title: "No Notes",
        description: "There are no notes to summarize.",
        variant: "default",
      });
      return;
    }

    setIsSummarizing(true);
    setSummary(null);

    try {
      const notesToSummarize = initialNotes
        .map((note, i) => {
          const date = note.createdAt
            ? format(new Date(note.createdAt), "PPP")
            : "Unknown date";
          return `Note ${i + 1} on ${date}: ${note.description}`;
        })
        .join("\n\n");

      const input: SummarizeCaseNotesInput = { caseNotes: notesToSummarize };
      const result = await summarizeCaseNotes(input);
      setSummary(result.summary);
      toast({
        title: "Summary Generated",
        description: "AI has summarized the case notes.",
      });
    } catch (error) {
      console.error("Failed to summarize notes:", error);
      toast({
        title: "Summarization Failed",
        description: "Could not generate summary.",
        variant: "destructive",
      });
      setSummary("Error generating summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Case Notes</span>
          <Button
            onClick={handleSummarizeNotes}
            disabled={isSummarizing || initialNotes.length === 0}
            size="sm"
            variant="outline"
          >
            {isSummarizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            AI Summary
          </Button>
        </CardTitle>
        <CardDescription>
          Record important details and observations about the case.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {summary && (
          <Alert className="mb-4 bg-primary/5 border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
            <AlertTitle className="font-headline text-primary">
              AI Generated Summary
            </AlertTitle>
            <AlertDescription className="whitespace-pre-wrap text-sm">
              {summary}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Textarea
            placeholder="Type your new note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            disabled={isAddingNote}
          />
          <Button
            onClick={handleAddNote}
            disabled={isAddingNote || !newNote.trim()}
          >
            {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Note
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="mt-6">
            <h5 className="text-md font-semibold mb-2">Existing Notes:</h5>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/30 space-y-4">
              {notes
                .slice()
                .reverse()
                .map((note, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md bg-background shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Note {initialNotes.length - index}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {note.createdAt
                          ? format(
                              typeof note.createdAt === "string"
                                ? new Date(note.createdAt)
                                : note.createdAt,
                              "PPp"
                            )
                          : "Unknown time"}

                        {/* {format(new Date(note.createdAt), "PPP")}   */}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {note.description}
                    </p>
                  </div>
                ))}
            </ScrollArea>
          </div>
        )}
        {notes.length === 0 && !summary && (
          <p className="text-center text-muted-foreground py-4">
            No notes recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import type { Note } from "@/lib/model";
// import { addNoteToCase } from "@/lib/caseService"; // Mock service
// import { useAuth } from "@/context/AuthContext";
// import { summarizeCaseNotes, type SummarizeCaseNotesInput } from "@/ai/flows/summarize-case-notes";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { format } from "date-fns";
// import { Bot, MessageSquare, UserCircle, Loader2, Sparkles } from "lucide-react";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// interface CaseNotesProps {
//   caseId: string;
//   initialNotes: Note[];
//   onNoteAdded: (note: Note) => void;
// }

// export function CaseNotes({ caseId, initialNotes, onNoteAdded }: CaseNotesProps) {
//   const [newNote, setNewNote] = useState("");
//   const [isAddingNote, setIsAddingNote] = useState(false);
//   const [isSummarizing, setIsSummarizing] = useState(false);
//   const [summary, setSummary] = useState<string | null>(null);
//   const { user } = useAuth();
//   const { toast } = useToast();

//   const handleAddNote = async () => {
//     if (!newNote.trim() || !user) return;

//     setIsAddingNote(true);
//     try {
//       const createdNote = await addNoteToCase(caseId, {
//         message: newNote,
//         by: user.uid,
//         byName: `${user.firstName} ${user.lastName}`,
//       });

//       if (createdNote) {
//         onNoteAdded(createdNote);
//         setNewNote("");
//         toast({ title: "Note Added", description: "Your note has been successfully added." });
//       } else {
//         throw new Error("Failed to add note at service level.");
//       }
//     } catch (error) {
//       console.error("Failed to add note:", error);
//       toast({ title: "Error Adding Note", description: "Could not save your note.", variant: "destructive" });
//     } finally {
//       setIsAddingNote(false);
//     }
//   };

//   const handleSummarizeNotes = async () => {
//     if (initialNotes.length === 0) {
//       toast({ title: "No Notes", description: "There are no notes to summarize.", variant: "default" });
//       return;
//     }
//     setIsSummarizing(true);
//     setSummary(null); // Clear previous summary
//     try {
//       const notesToSummarize = initialNotes.map(note => `${note.byName || 'User'} on ${format(new Date(note.at), 'PPp')}: ${note.message}`).join("\n\n");
//       const input: SummarizeCaseNotesInput = { caseNotes: notesToSummarize };
//       const result = await summarizeCaseNotes(input);
//       setSummary(result.summary);
//       toast({ title: "Summary Generated", description: "AI has summarized the case notes." });
//     } catch (error) {
//       console.error("Failed to summarize notes:", error);
//       toast({ title: "Summarization Failed", description: "Could not generate summary.", variant: "destructive" });
//       setSummary("Error generating summary.");
//     } finally {
//       setIsSummarizing(false);
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//             <span>Case Notes</span>
//             <Button onClick={handleSummarizeNotes} disabled={isSummarizing || initialNotes.length === 0} size="sm" variant="outline">
//             {isSummarizing ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//                 <Sparkles className="mr-2 h-4 w-4" />
//             )}
//             AI Summary
//             </Button>
//         </CardTitle>
//         <CardDescription>Record important details and observations about the case.</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {summary && (
//           <Alert className="mb-4 bg-primary/5 border-primary/20">
//             <Bot className="h-5 w-5 text-primary" />
//             <AlertTitle className="font-headline text-primary">AI Generated Summary</AlertTitle>
//             <AlertDescription className="whitespace-pre-wrap text-sm">
//               {summary}
//             </AlertDescription>
//           </Alert>
//         )}

//         <div className="space-y-3">
//           <Textarea
//             placeholder="Type your new note here..."
//             value={newNote}
//             onChange={(e) => setNewNote(e.target.value)}
//             rows={4}
//             disabled={isAddingNote}
//           />
//           <Button onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()}>
//             {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Add Note
//           </Button>
//         </div>

//         {initialNotes.length > 0 && (
//           <div className="mt-6">
//             <h5 className="text-md font-semibold mb-2">Existing Notes:</h5>
//             <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/30 space-y-4">
//               {initialNotes.slice().reverse().map((note, index) => ( // Display newest first
//                 <div key={index} className="p-3 rounded-md bg-background shadow-sm">
//                   <div className="flex items-center justify-between mb-1">
//                     <div className="flex items-center gap-2">
//                         <UserCircle className="h-5 w-5 text-muted-foreground" />
//                         <span className="text-sm font-medium">{note.byName || 'Unknown User'}</span>
//                     </div>
//                     <span className="text-xs text-muted-foreground">{format(new Date(note.at), "PPp")}</span>
//                   </div>
//                   <p className="text-sm whitespace-pre-wrap">{note.message}</p>
//                 </div>
//               ))}
//             </ScrollArea>
//           </div>
//         )}
//         {initialNotes.length === 0 && !summary && (
//             <p className="text-center text-muted-foreground py-4">No notes recorded yet.</p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
