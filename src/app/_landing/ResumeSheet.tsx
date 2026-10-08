const skills = ["Figma", "Design systems", "Prototyping", "Research"];

export default function ResumeSheet() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-210/297 w-full overflow-hidden rounded-sm bg-paper p-[6%] text-paper-foreground shadow-2xl shadow-black/40 ring-1 ring-black/10"
    >
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-primary pb-[3%]">
        <div>
          <p className="font-display text-[clamp(1rem,3.4vw,1.75rem)] font-bold leading-none">
            Amara Okafor
          </p>
          <p className="mt-1 text-[clamp(0.55rem,1.4vw,0.8rem)] text-paper-muted">
            Product Designer
          </p>
        </div>
        <p className="text-right text-[clamp(0.45rem,1.1vw,0.65rem)] leading-tight text-paper-muted">
          Leeds, United Kingdom
          <br />
          amara@example.com
        </p>
      </div>

      <section className="mt-[4%]">
        <h3 className="text-[clamp(0.55rem,1.3vw,0.75rem)] font-semibold uppercase tracking-wider text-paper-accent">
          Professional profile
        </h3>
        <p className="mt-1.5 rounded-sm bg-primary/15 px-1.5 py-1 text-[clamp(0.5rem,1.2vw,0.7rem)] leading-relaxed">
          Product designer with eight years of experience turning messy
          workflows into calm, usable software. Led the redesign of a payments
          dashboard used by 40,000 small businesses.
        </p>
      </section>

      <section className="mt-[4%]">
        <h3 className="text-[clamp(0.55rem,1.3vw,0.75rem)] font-semibold uppercase tracking-wider text-paper-accent">
          Work experience
        </h3>
        <div className="mt-1.5 flex justify-between gap-2 text-[clamp(0.5rem,1.2vw,0.7rem)] font-semibold">
          <span>Senior Product Designer, Ledgerly</span>
          <span className="shrink-0 font-normal text-paper-muted">
            2021 - Present
          </span>
        </div>
        <ul className="mt-1 flex flex-col gap-1 text-[clamp(0.5rem,1.2vw,0.7rem)] leading-relaxed">
          <li>
            Cut onboarding time from 9 minutes to 4 with a new set-up flow.
          </li>
          <li>Built the component library adopted by five product teams.</li>
        </ul>
        <div className="mt-2 flex justify-between gap-2 text-[clamp(0.5rem,1.2vw,0.7rem)] font-semibold">
          <span>Product Designer, Northwind Studio</span>
          <span className="shrink-0 font-normal text-paper-muted">
            2018 - 2021
          </span>
        </div>
        <ul className="mt-1 flex flex-col gap-1 text-[clamp(0.5rem,1.2vw,0.7rem)] leading-relaxed">
          <li>Shipped mobile apps for retail and healthcare clients.</li>
        </ul>
      </section>

      <section className="mt-[4%]">
        <h3 className="text-[clamp(0.55rem,1.3vw,0.75rem)] font-semibold uppercase tracking-wider text-paper-accent">
          Education
        </h3>
        <div className="mt-1.5 flex justify-between gap-2 text-[clamp(0.5rem,1.2vw,0.7rem)]">
          <span className="font-semibold">BA Graphic Communication</span>
          <span className="shrink-0 text-paper-muted">2014 - 2017</span>
        </div>
      </section>

      <section className="mt-[4%]">
        <h3 className="text-[clamp(0.55rem,1.3vw,0.75rem)] font-semibold uppercase tracking-wider text-paper-accent">
          Skills
        </h3>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-primary px-2 py-0.5 text-[clamp(0.45rem,1.1vw,0.65rem)] font-medium text-primary-foreground"
            >
              {skill}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
