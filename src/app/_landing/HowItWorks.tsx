const steps = [
  {
    title: "Add your details",
    body: "Work through short steps: who you are, where you have worked, what you studied and what you are good at.",
  },
  {
    title: "Let the AI draft the wording",
    body: "Describe a role in a sentence and get polished bullet points. Generate a profile summary from everything you have entered.",
  },
  {
    title: "Preview, then export",
    body: "The page updates as you type. When it looks right, print it to a clean PDF sized for A4.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="border-y bg-card/50"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2
          id="how-it-works-title"
          className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl"
        >
          From blank page to finished resume in three steps
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full border border-primary text-sm font-semibold text-brand"
              >
                {index + 1}
              </span>
              <h3 className="font-display text-xl font-semibold">
                {step.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
