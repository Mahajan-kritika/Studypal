'use server';

/**
 * @fileOverview AI-powered tool that breaks down complex topics into easy-to-understand concepts.
 *
 * - intelligentExplanation - A function that handles the process of simplifying complex topics.
 * - IntelligentExplanationInput - The input type for the intelligentExplanation function.
 * - IntelligentExplanationOutput - The return type for the intelligentExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentExplanationInputSchema = z.object({
  topic: z.string().min(1, { message: 'Please enter a topic.' }),
  explanationLevel: z.enum(['Simple', 'Detailed', 'Expert']).describe('The desired level of detail for the explanation.'),
});
export type IntelligentExplanationInput = z.infer<typeof IntelligentExplanationInputSchema>;

const IntelligentExplanationOutputSchema = z.object({
    summary: z.string().describe("A concise one-sentence summary of the topic."),
    detailedExplanation: z.string().describe("The main, detailed explanation of the topic, formatted with markdown-style headers (e.g., **Header**) and lists (e.g., * item). The length should be appropriate for the topic and explanation level."),
    analogy: z.string().describe("A simple analogy to help understand the core concept."),
    diagramUrl: z.string().describe("A data URI of a diagram explaining the topic."),
});
export type IntelligentExplanationOutput = z.infer<typeof IntelligentExplanationOutputSchema>;

export async function intelligentExplanation(
  input: IntelligentExplanationInput
): Promise<IntelligentExplanationOutput> {
  return intelligentExplanationFlow(input);
}

const diagramPromptSchema = z.object({
  diagramPrompt: z.string().describe("A short, descriptive prompt for a text-to-image model to generate a well-labelled, simple diagram or illustration for the topic. For example: 'A simple, clear diagram of the water cycle with labels for evaporation, condensation, precipitation, and collection.'"),
});

const prompt = ai.definePrompt({
  name: 'intelligentExplanationPrompt',
  input: {schema: IntelligentExplanationInputSchema},
  output: {schema: IntelligentExplanationOutputSchema.omit({ diagramUrl: true }).merge(diagramPromptSchema)},
  prompt: `You are an expert educator skilled at explaining complex topics in simple terms. Your task is to provide a comprehensive explanation of a given topic tailored to a specific level of detail.

Topic: "{{topic}}"
Level: "{{explanationLevel}}"

Generate the following based on the topic and level:
1.  **Summary:** A concise, one-sentence summary.
2.  **Detailed Explanation:** A thorough explanation of the topic. Use markdown for structure, like **Headers** for sections and * for list items. The length and depth should match the requested "{{explanationLevel}}". Do not impose an artificial word limit.
3.  **Analogy:** A simple and relatable analogy to clarify the core concept.
4.  **Diagram Prompt:** A short, descriptive prompt for a text-to-image model to generate a well-labelled, simple diagram or illustration for the topic. For example: 'A simple, clear diagram of the water cycle with labels for evaporation, condensation, precipitation, and collection.'
`,
});

const intelligentExplanationFlow = ai.defineFlow(
  {
    name: 'intelligentExplanationFlow',
    inputSchema: IntelligentExplanationInputSchema,
    outputSchema: IntelligentExplanationOutputSchema,
  },
  async input => {
    const explanationResult = await prompt(input);
    const explanationOutput = explanationResult.output;
    
    if (!explanationOutput) {
        throw new Error('Failed to generate explanation text.');
    }

    let diagramUrl = '';
    try {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: explanationOutput.diagramPrompt,
        });
        diagramUrl = media?.url || '';
    } catch (error) {
        console.error("Failed to generate diagram, likely a billing issue:", error);
        // Fail gracefully if diagram generation fails
        diagramUrl = '';
    }
    
    return {
        summary: explanationOutput.summary,
        detailedExplanation: explanationOutput.detailedExplanation,
        analogy: explanationOutput.analogy,
        diagramUrl: diagramUrl,
    };
  }
);
