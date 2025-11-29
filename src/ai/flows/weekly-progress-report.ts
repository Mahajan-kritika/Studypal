'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating weekly progress reports.
 *
 * The flow takes user learning data as input and uses AI to create a comprehensive report
 * summarizing progress, highlighting strengths and weaknesses, and suggesting areas for improvement.
 *
 * @exported {
 *   generateWeeklyProgressReport: (input: WeeklyProgressReportInput) => Promise<WeeklyProgressReportOutput>;
 *   WeeklyProgressReportInput: z.infer<typeof WeeklyProgressReportInputSchema>;
 *   WeeklyProgressReportOutput: z.infer<typeof WeeklyProgressReportOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubjectProgressSchema = z.object({
  subject: z.string().describe('The name of the subject.'),
  topicsStudied: z.array(z.string()).describe('A list of topics studied within the subject.'),
  timeSpent: z.string().describe('Total time spent studying this subject during the week (e.g., "4 hours").'),
  practiceTestScores: z.array(z.object({
    testName: z.string().describe('Name or description of the test/quiz.'),
    score: z.string().describe('The score obtained (e.g., "78%").'),
  })).describe('Scores from practice tests taken for this subject.'),
});

// Input schema for the weekly progress report flow
const WeeklyProgressReportInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  startDate: z.string().describe('The start date of the week for the report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the week for the report (YYYY-MM-DD).'),
  learningData: z.array(SubjectProgressSchema).describe('An array of learning data for each subject studied during the week.'),
  overallSummary: z.object({
    totalTimeSpent: z.string().describe('Total time spent across all subjects.'),
    generalObservations: z.string().optional().describe('Any general observations or notes about the student\'s week.'),
  }).describe('An overall summary of the week\'s learning activities.'),
});

export type WeeklyProgressReportInput = z.infer<typeof WeeklyProgressReportInputSchema>;

const SubjectAnalysisSchema = z.object({
    subject: z.string(),
    analysis: z.string().describe("A brief analysis of the student's performance in this subject, including insights on time spent, topics covered, and test scores."),
});

// Output schema for the weekly progress report flow
const WeeklyProgressReportOutputSchema = z.object({
  overallSummary: z.string().describe("A 2-3 sentence overview of the student's week, including total time spent and general observations."),
  subjectAnalyses: z.array(SubjectAnalysisSchema).describe("An array of analyses for each subject studied."),
  keyStrengths: z.array(z.string()).describe("A bulleted list of 2-3 key strengths observed during the week."),
  focusAreas: z.array(z.string()).describe("A bulleted list of 2-3 actionable areas for improvement for the next week."),
  finalSummary: z.string().describe("A brief, encouraging concluding sentence to motivate the student."),
});

export type WeeklyProgressReportOutput = z.infer<typeof WeeklyProgressReportOutputSchema>;

// Exported function to generate the weekly progress report
export async function generateWeeklyProgressReport(input: WeeklyProgressReportInput): Promise<WeeklyProgressReportOutput> {
  return weeklyProgressReportFlow(input);
}

// Define the prompt for generating the weekly progress report
const weeklyProgressReportPrompt = ai.definePrompt({
  name: 'weeklyProgressReportPrompt',
  input: {schema: WeeklyProgressReportInputSchema},
  output: {schema: WeeklyProgressReportOutputSchema},
  prompt: `You are an AI learning assistant. Generate a detailed weekly progress report for the user based on their learning data for the week of {{{startDate}}} to {{{endDate}}}.

  The report must be insightful, encouraging, and structured according to the output schema.

  **User Learning Data:**
  - **Overall Summary:** Total time spent: {{{overallSummary.totalTimeSpent}}}. General notes: {{{overallSummary.generalObservations}}}
  - **Subject Data:**
  {{#each learningData}}
  - **Subject: {{subject}}**
    - Time Spent: {{timeSpent}}
    - Topics Covered: {{#each topicsStudied}}{{.}}{{#unless @last}}, {{/unless}}{{/each}}
    - Practice Test Performance:
      {{#each practiceTestScores}}
      - {{testName}}: {{score}}
      {{/each}}
  {{/each}}

  **Your Task:**
  Based on the data above, generate the following JSON output:

  1.  **overallSummary**: A 2-3 sentence overview of the student's week, incorporating the total time spent and any general observations.
  2.  **subjectAnalyses**: For each subject, provide a brief analysis. Comment on the test scores to identify strengths and weaknesses. For example, if scores are improving, mention that. If a score is low, suggest revisiting the topic. Also comment on the time spent in relation to the topics covered.
  3.  **keyStrengths**: A bulleted list of 2-3 key strengths based on all the provided data.
  4.  **focusAreas**: A bulleted list of 2-3 actionable suggestions for the upcoming week, focusing on topics or subjects that need more attention.
  5.  **finalSummary**: A brief, encouraging concluding sentence to motivate the student for the week ahead.
  `,
});

// Define the Genkit flow for generating the weekly progress report
const weeklyProgressReportFlow = ai.defineFlow(
  {
    name: 'weeklyProgressReportFlow',
    inputSchema: WeeklyProgressReportInputSchema,
    outputSchema: WeeklyProgressReportOutputSchema,
  },
  async input => {
    const {output} = await weeklyProgressReportPrompt(input);
    return output!;
  }
);
