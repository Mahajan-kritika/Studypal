'use server';

/**
 * @fileOverview Personalized study plan generator.
 *
 * - generatePersonalizedStudyPlan - A function that generates a personalized study plan.
 * - PersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - PersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedStudyPlanInputSchema = z.object({
  goals: z.string().describe('Your goals for studying.'),
  deadline: z.string().describe('Your deadline for achieving your goals.'),
  learningPace: z.string().describe('Your preferred learning pace (e.g., fast, moderate, slow).'),
});
export type PersonalizedStudyPlanInput = z.infer<typeof PersonalizedStudyPlanInputSchema>;

const WeeklyScheduleSchema = z.object({
    day: z.string().describe('Day of the week (e.g., Monday).'),
    focusTopics: z.array(z.string()).describe('Topics to focus on for that day.'),
    estimatedTime: z.string().describe('Estimated time commitment for the day (e.g., "2 hours").'),
});

const PersonalizedStudyPlanOutputSchema = z.object({
    keyHighlights: z.array(z.string()).describe('A few key bullet points highlighting the overall strategy of the study plan.'),
    weeklySchedule: z.array(WeeklyScheduleSchema).describe('A structured weekly schedule that can be displayed in a table.'),
    finalSummary: z.string().describe('A concluding summary statement to encourage the user.'),
});
export type PersonalizedStudyPlanOutput = z.infer<typeof PersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: PersonalizedStudyPlanInput): Promise<PersonalizedStudyPlanOutput> {
  return personalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedStudyPlanPrompt',
  input: {schema: PersonalizedStudyPlanInputSchema},
  output: {schema: PersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI study plan generator. Generate a personalized study plan based on the user's goals, deadline, and learning pace.

Goals: {{{goals}}}
Deadline: {{{deadline}}}
Learning Pace: {{{learningPace}}}

Break down the plan into:
1.  Key Highlights: Provide 3-4 bullet points summarizing the approach.
2.  Weekly Schedule: Create a structured schedule for a week (e.g., Day 1/Monday, Day 2/Tuesday, etc.). For each day, list the focus topics and an estimated time. This should be an array of objects.
3.  Final Summary: A brief, encouraging concluding sentence.
`,
});

const personalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'personalizedStudyPlanFlow',
    inputSchema: PersonalizedStudyPlanInputSchema,
    outputSchema: PersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
