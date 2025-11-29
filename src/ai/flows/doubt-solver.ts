'use server';

/**
 * @fileOverview An AI-powered assistant to answer user academic questions, with multimodal support.
 *
 * - solveDoubt - A function that handles answering user questions.
 * - SolveDoubtInput - The input type for the solveDoubt function.
 * - SolveDoubtOutput - The return type for the solveDoubt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveDoubtInputSchema = z.object({
  doubt: z.string().describe("The user's academic question or doubt. This might provide context for the uploaded file."),
  fileDataUri: z.string().optional().describe("An optional file related to the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SolveDoubtInput = z.infer<typeof SolveDoubtInputSchema>;

const SolveDoubtOutputSchema = z.object({
    answer: z.string().describe("A helpful and clear, step-by-step answer to the user's question, considering both the text and the file provided. The answer should be formatted with markdown-style headers (e.g., **Header**) and lists (e.g., * item)."),
});
export type SolveDoubtOutput = z.infer<typeof SolveDoubtOutputSchema>;

export async function solveDoubt(
  input: SolveDoubtInput
): Promise<SolveDoubtOutput> {
  return solveDoubtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveDoubtPrompt',
  input: {schema: SolveDoubtInputSchema},
  output: {schema: SolveDoubtOutputSchema},
  prompt: `You are an expert tutor for students of all ages. Your goal is to answer a user's academic question or doubt in a clear, friendly, and step-by-step manner.

You will be given a text-based question and an optional file (which could be an image, document, spreadsheet, etc.). You must use both to formulate your answer. The file may contain the entire problem.

Break down complex concepts into simple parts. Use markdown for formatting, like **headers** for important sections and * for lists to make the explanation easy to follow.

User's Doubt: "{{doubt}}"
{{#if fileDataUri}}
User's Uploaded File:
{{media url=fileDataUri}}
{{/if}}
`,
});

const solveDoubtFlow = ai.defineFlow(
  {
    name: 'solveDoubtFlow',
    inputSchema: SolveDoubtInputSchema,
    outputSchema: SolveDoubtOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
