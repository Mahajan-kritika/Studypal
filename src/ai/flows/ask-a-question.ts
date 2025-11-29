'use server';

/**
 * @fileOverview An AI-powered assistant to answer user questions about the StudyPal app and navigate them.
 *
 * - askQuestion - A function that handles answering user questions.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about the StudyPal application."),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
    answer: z.string().describe("A helpful and concise answer to the user's question. The answer should be formatted with markdown-style headers (e.g., **Header**) and lists (e.g., * item)."),
    navigationTarget: z.string().optional().describe("The path to navigate to if the user's intent is to go to a specific page. Should be one of the provided application paths (e.g., '/dashboard', '/practice')."),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are a friendly and helpful support assistant for an application called "StudyPal". Your goal is to answer user questions about how to use the app and to help them navigate.

Here are the main features of StudyPal and their application paths:
- **Dashboard**: '/dashboard' - Shows an overview of weekly progress and quick actions.
- **Study Plan**: '/study-plan' - A personalized study plan generator.
- **Explanations**: '/explanations' - An "Intelligent Explanations" feature to break down complex topics.
- **Practice**: '/practice' - A "Practice Test Generator" for creating quizzes.
- **Doubt Solver**: '/doubt-solver' - An AI tutor to solve academic questions.
- **Analytics**: '/analytics' - A dashboard with charts for study performance.
- **Progress**: '/progress' - A "Student Progress Report" generator.
- **History**: '/history' - A log of all generated content.
- **Profile**: '/profile' - Where users can update their profile.
- **Students**: '/students' - A roster to manage students (for teachers/parents).
- **Help**: '/help' - The page you are on now.

Your Tasks:
1.  **Answer Questions:** Based on the user's question, provide a clear, concise, and helpful answer. Use markdown for formatting, like **headers** and * for lists. Be friendly and conversational.
2.  **Detect Navigation Intent:** If the user's question implies they want to go to a specific page (e.g., "take me to my practice tests", "I want to see my history", "open my profile"), set the 'navigationTarget' field in your response to the corresponding path from the list above. If you do this, also include a short confirmation in your answer, like "Sure, taking you to the practice page now...".
3.  **Prioritize Answers:** If the user is just asking a question (e.g., "How does analytics work?"), answer it thoroughly and leave the 'navigationTarget' field empty. Only set it if the primary intent is to navigate.

User's Question: "{{question}}"
`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
