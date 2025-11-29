
import AppLayout from '@/components/layout/app-layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';
import { AskQuestion } from '@/components/help/ask-question';

const faqs = [
    {
      question: "How do I update my profile information?",
      answer: "Navigate to the 'Profile' tab from the main menu. Here you can change your name, class, field of study, and profile picture. Click 'Save Changes' when you're done."
    },
    {
      question: "How does the 'Intelligent Explanations' feature work?",
      answer: "Go to the 'Explanations' tab, enter any topic you want to learn about, select a detail level (Simple, Detailed, or Expert), and click 'Explain Topic'. The AI will generate a summary, a detailed breakdown, an analogy, and a diagram to help you understand."
    },
    {
      question: "How do I generate a practice test?",
      answer: "On the 'Practice' tab, your class and field of study are pre-filled from your profile. Select a stream and subject, specify a topic and the number of questions, then click 'Generate Test'. All tests you take are automatically saved to your history and contribute to your analytics."
    },
    {
      question: "What is the 'Analytics' tab for?",
      answer: "The 'Analytics' tab provides a visual dashboard of your learning progress. It includes charts for your study time, topic mastery based on test scores, and a detailed performance breakdown for each topic you've been tested on."
    },
    {
      question: "How can I remove a topic from my analytics?",
      answer: "In the 'Analytics' tab, find the 'Tracked Topics' card. Simply click the 'x' button next to any topic you no longer wish to track. Your analytics charts will update automatically."
    },
    {
      question: "Where can I see my past activity?",
      answer: "The 'History' tab contains a complete log of all your generated study plans, explanations, and practice tests. You can expand each item to see the full details."
    }
  ];
  

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Help & Support
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about using StudyPal.
            </p>
          </div>
        </div>

        <AskQuestion />

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
                If you can't find an answer here, please reach out to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                    For further assistance, please contact our support team.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Email Support</p>
                        <a href="mailto:support@studypal.com" className="text-sm text-primary hover:underline">
                            support@studypal.com
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Phone Support</p>
                        <p className="text-sm text-muted-foreground">
                            +1 (800) 555-0123
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
