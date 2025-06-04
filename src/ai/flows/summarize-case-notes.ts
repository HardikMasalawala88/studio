// Summarize Case Notes
'use server';
/**
 * @fileOverview An AI agent that summarizes case notes.
 *
 * - summarizeCaseNotes - A function that handles the summarization of case notes.
 * - SummarizeCaseNotesInput - The input type for the summarizeCaseNotes function.
 * - SummarizeCaseNotesOutput - The return type for the summarizeCaseNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCaseNotesInputSchema = z.object({
  caseNotes: z.string().describe('The case notes to summarize.'),
});
export type SummarizeCaseNotesInput = z.infer<typeof SummarizeCaseNotesInputSchema>;

const SummarizeCaseNotesOutputSchema = z.object({
  summary: z.string().describe('The summary of the case notes.'),
});
export type SummarizeCaseNotesOutput = z.infer<typeof SummarizeCaseNotesOutputSchema>;

export async function summarizeCaseNotes(input: SummarizeCaseNotesInput): Promise<SummarizeCaseNotesOutput> {
  return summarizeCaseNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCaseNotesPrompt',
  input: {schema: SummarizeCaseNotesInputSchema},
  output: {schema: SummarizeCaseNotesOutputSchema},
  prompt: `You are an experienced legal assistant. Please summarize the following case notes, highlighting the most important and relevant information for an upcoming hearing.\n\nCase Notes:\n{{{caseNotes}}}`,
});

const summarizeCaseNotesFlow = ai.defineFlow(
  {
    name: 'summarizeCaseNotesFlow',
    inputSchema: SummarizeCaseNotesInputSchema,
    outputSchema: SummarizeCaseNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
