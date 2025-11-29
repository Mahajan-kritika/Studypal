
'use server';

/**
 * @fileOverview A practice test generator AI agent.
 *
 * - generatePracticeTest - A function that handles the practice test generation process for students.
 * - GeneratePracticeTestInput - The input type for the generatePracticeTest function.
 * - GeneratePracticeTestOutput - The return type for the generatePracticeTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerKeySchema = z.object({
    question: z.string().describe('A single test question.'),
    answer: z.string().describe('The correct answer to the question.'),
});

// For Students
const GeneratePracticeTestInputSchema = z.object({
  class: z.string().describe('The class level of the student and the educational board (e.g., "10th Grade (CBSE)").'),
  subject: z.string().describe('The subject for the test (e.g., "Mathematics").'),
  topic: z.string().describe('The specific topic within the subject (e.g., "Algebra").'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GeneratePracticeTestInput = z.infer<typeof GeneratePracticeTestInputSchema>;

const GeneratePracticeTestOutputSchema = z.object({
    answerKey: z.array(AnswerKeySchema).describe('An array of questions and their corresponding answers.'),
});
export type GeneratePracticeTestOutput = z.infer<typeof GeneratePracticeTestOutputSchema>;


export async function generatePracticeTest(input: GeneratePracticeTestInput): Promise<GeneratePracticeTestOutput> {
  return generatePracticeTestFlow(input);
}


const studentPrompt = ai.definePrompt({
  name: 'generatePracticeTestPrompt',
  input: {schema: GeneratePracticeTestInputSchema},
  output: {schema: GeneratePracticeTestOutputSchema},
  prompt: `You are an expert in generating practice tests for students.

  Class and Board: {{{class}}}
  Subject: {{{subject}}}
  Topic: {{{topic}}}

  Generate {{{numberOfQuestions}}} practice test questions based on the provided details.
  For each question, provide a clear and correct answer.
  Return the result as a JSON object containing an 'answerKey' which is an array of question-answer pairs.
  `,
});

const generatePracticeTestFlow = ai.defineFlow(
  {
    name: 'generatePracticeTestFlow',
    inputSchema: GeneratePracticeTestInputSchema,
    outputSchema: GeneratePracticeTestOutputSchema,
  },
  async input => {
    const {output} = await studentPrompt(input);
    return output!;
  }
);
