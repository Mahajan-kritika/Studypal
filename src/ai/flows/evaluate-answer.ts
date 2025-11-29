'use server';

/**
 * @fileOverview AI-powered tool to evaluate if a student's answer is correct, even if not an exact match.
 *
 * - evaluateAnswer - A function that handles the semantic evaluation of an answer.
 * - EvaluateAnswerInput - The input type for the evaluateAnswer function.
 * - EvaluateAnswerOutput - The return type for the evaluateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateAnswerInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  studentAnswer: z.string().describe("The student's answer."),
  correctAnswer: z.string().describe('The correct answer key.'),
});
export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

const EvaluateAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the student\'s answer is semantically correct.'),
});
export type EvaluateAnswerOutput = z.infer<typeof EvaluateAnswerOutputSchema>;

export async function evaluateAnswer(
  input: EvaluateAnswerInput
): Promise<EvaluateAnswerOutput> {
  return evaluateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateAnswerPrompt',
  input: {schema: EvaluateAnswerInputSchema},
  output: {schema: EvaluateAnswerOutputSchema},
  prompt: `You are an expert examiner. Your task is to evaluate a student's answer for a given question against the correct answer.

You must determine if the student's answer is semantically correct, even if the wording is different, there are minor omissions (like units), or extra conversational text. Focus on the core concept.

Question: "{{question}}"
Correct Answer: "{{correctAnswer}}"
Student's Answer: "{{studentAnswer}}"

Is the student's answer fundamentally correct?`,
});

const evaluateAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: EvaluateAnswerOutputSchema,
  },
  async input => {
    // If the student's answer is empty, it's incorrect.
    if (!input.studentAnswer || input.studentAnswer.trim() === '') {
        return { isCorrect: false };
    }
    // For very simple, direct matches, we can return true immediately.
    if (input.studentAnswer.trim().toLowerCase() === input.correctAnswer.trim().toLowerCase()) {
        return { isCorrect: true };
    }

    const {output} = await prompt(input);
    return output!;
  }
);
