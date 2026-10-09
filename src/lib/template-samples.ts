import type { ResumeTemplate } from "./templates";
import type { ResumeValues } from "./validation";

type SampleContent = Omit<ResumeValues, "template">;

interface SamplePerson {
  id: string;
  label: string;
  content: SampleContent;
}

function bullets(...texts: string[]) {
  return texts.map((text) => ({ text, hidden: false }));
}

// Everything here is fictional. Contact details use ranges reserved for
// drama and examples (example.com, Ofcom 01632 960 and 07700 900).
export const samplePeople: SamplePerson[] = [
  {
    id: "engineer",
    label: "Software engineer",
    content: {
      colorHex: "#1d4ed8",
      borderStyle: "squircle",
      firstName: "Amara",
      lastName: "Osei",
      jobTitle: "Senior Software Engineer",
      city: "Manchester",
      country: "United Kingdom",
      phone: "07700 900123",
      email: "amara.osei@example.com",
      summary:
        "Full-stack engineer with eight years of experience shipping reliable web products. Leads small teams, mentors junior developers and cares about fast, accessible interfaces.",
      workExperiences: [
        {
          position: "Senior Software Engineer",
          company: "Northgate Payments",
          startDate: "2021-04-01",
          bullets: bullets(
            "Led a team of five to rebuild the checkout flow, cutting drop-off by 18%.",
            "Reduced average page load from 3.2s to 1.1s by moving rendering to the server.",
            "Introduced contract tests that removed a whole class of release-day incidents.",
          ),
        },
        {
          position: "Software Engineer",
          company: "Brightwell Logistics",
          startDate: "2018-09-01",
          endDate: "2021-03-01",
          bullets: bullets(
            "Built a route-planning dashboard used daily by 400 drivers.",
            "Mentored four graduates, three of whom were promoted within two years.",
          ),
        },
      ],
      projects: [
        {
          name: "Open-source accessibility linter",
          startDate: "2022-01-01",
          bullets: bullets(
            "Maintains a small library with 1,200 weekly downloads.",
          ),
        },
      ],
      educations: [
        {
          degree: "BSc Computer Science",
          school: "University of Leeds",
          startDate: "2014-09-01",
          endDate: "2018-06-01",
        },
      ],
      certifications: [
        { name: "AWS Certified Developer", issuer: "Amazon Web Services" },
      ],
      skills: [
        "TypeScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "Testing",
        "Accessibility",
        "Team leadership",
      ],
      languages: [
        { name: "English", level: "Native" },
        { name: "Twi", level: "Conversational" },
      ],
      links: [{ label: "Portfolio", url: "https://example.com/amara" }],
    },
  },
  {
    id: "nurse",
    label: "Registered nurse",
    content: {
      colorHex: "#0f766e",
      borderStyle: "circle",
      firstName: "Daniel",
      lastName: "Reyes",
      jobTitle: "Registered Nurse, Acute Care",
      city: "Bristol",
      country: "United Kingdom",
      phone: "01632 960456",
      email: "daniel.reyes@example.com",
      summary:
        "Compassionate registered nurse with six years on busy acute wards. Calm under pressure, strong at patient education and at coordinating care across multidisciplinary teams.",
      workExperiences: [
        {
          position: "Registered Nurse",
          company: "Riverside General Hospital",
          startDate: "2020-02-01",
          bullets: bullets(
            "Cared for up to 12 patients per shift on a 32-bed medical ward.",
            "Cut medication errors on the ward by 25% by leading a double-check routine.",
            "Trained and supported eight newly qualified nurses through preceptorship.",
          ),
        },
        {
          position: "Staff Nurse",
          company: "Oakfield Community Clinic",
          startDate: "2017-10-01",
          endDate: "2020-01-01",
          bullets: bullets(
            "Delivered wound care and long-term condition reviews for 60 patients a week.",
            "Ran monthly diabetes education sessions with 90% attendance.",
          ),
        },
      ],
      educations: [
        {
          degree: "BSc Adult Nursing",
          school: "University of the West of England",
          startDate: "2014-09-01",
          endDate: "2017-07-01",
        },
      ],
      certifications: [
        { name: "Advanced Life Support", issuer: "Resuscitation Council UK" },
        { name: "Venepuncture and Cannulation", issuer: "Riverside NHS Trust" },
      ],
      skills: [
        "Patient assessment",
        "Medication administration",
        "Wound care",
        "Electronic patient records",
        "Patient education",
        "Handover and escalation",
      ],
      languages: [
        { name: "English", level: "Native" },
        { name: "Spanish", level: "Fluent" },
      ],
      links: [],
    },
  },
  {
    id: "marketer",
    label: "Marketing manager",
    content: {
      colorHex: "#be185d",
      borderStyle: "square",
      firstName: "Priya",
      lastName: "Nair",
      jobTitle: "Digital Marketing Manager",
      city: "London",
      country: "United Kingdom",
      phone: "07700 900789",
      email: "priya.nair@example.com",
      summary:
        "Digital marketer who blends data and storytelling to grow subscription brands. Has owned budgets up to 400,000 pounds and built content engines that keep paying back.",
      workExperiences: [
        {
          position: "Digital Marketing Manager",
          company: "Lumen Home",
          startDate: "2020-06-01",
          bullets: bullets(
            "Grew organic sign-ups by 140% in two years with a new content and SEO plan.",
            "Managed a 400,000 pound annual paid budget at a 3.4x return on spend.",
            "Launched a lifecycle email programme that lifted repeat purchase by 22%.",
          ),
        },
        {
          position: "Marketing Executive",
          company: "Fernhill Foods",
          startDate: "2017-08-01",
          endDate: "2020-05-01",
          bullets: bullets(
            "Ran social campaigns that doubled the brand's following to 85,000.",
            "Built the first weekly performance report used by the leadership team.",
          ),
        },
      ],
      projects: [
        {
          name: "Customer story series",
          startDate: "2021-03-01",
          bullets: bullets("Produced 24 stories that now drive 30% of demo requests."),
        },
      ],
      educations: [
        {
          degree: "BA Marketing and Communications",
          school: "University of Nottingham",
          startDate: "2013-09-01",
          endDate: "2016-06-01",
        },
      ],
      certifications: [
        { name: "Google Analytics Certification", issuer: "Google" },
      ],
      skills: [
        "Campaign strategy",
        "SEO and content",
        "Paid media",
        "Email marketing",
        "Analytics",
        "Budget management",
        "Stakeholder reporting",
      ],
      languages: [
        { name: "English", level: "Native" },
        { name: "Malayalam", level: "Fluent" },
      ],
      links: [{ label: "Portfolio", url: "https://example.com/priya" }],
    },
  },
];

export function sampleResume(
  personId: string,
  template: ResumeTemplate,
): ResumeValues {
  const person = samplePeople.find((candidate) => candidate.id === personId);
  if (!person) {
    throw new Error(`Unknown sample person: ${personId}`);
  }
  return { ...person.content, template };
}
