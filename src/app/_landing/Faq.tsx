import { Plus } from "lucide-react";

const questions = [
  {
    question: "Is it really free?",
    answer:
      "Yes. The Free plan lets you build and export one resume without entering a card. Upgrade only if you want more resumes or the AI tools.",
  },
  {
    question: "What does the AI actually write?",
    answer:
      "On Pro and Pro Plus it drafts a profile summary and the bullet points for each job from the details you give it. You can edit every word before you export.",
  },
  {
    question: "How do I get my resume as a PDF?",
    answer:
      "Use the print button in the editor and choose Save as PDF. The page is laid out for A4 with margins already set.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Any time, from the billing page. It opens a secure portal where you can cancel or change plan. You keep your paid features until the end of the period you have paid for.",
  },
  {
    question: "Who can see my resumes?",
    answer:
      "Only you. Every resume belongs to your account and is only returned when you are signed in as its owner.",
  },
] as const;

export default function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto max-w-3xl px-4 py-20 sm:px-6"
    >
      <h2
        id="faq-title"
        className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl"
      >
        Questions, answered
      </h2>
      <div className="mt-10 border-t">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group border-b">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {question}
              <Plus
                className="size-5 shrink-0 text-brand transition-transform group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-5 leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
