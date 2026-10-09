import type { ResumeServerData } from "@/lib/types";

export const jobPost =
  "We are hiring a Senior Frontend Engineer to build React and TypeScript interfaces for our customers. " +
  "You will own features end to end, work with designers, and mentor other engineers on the team. " +
  "Experience with Kubernetes is a plus but not required for this role.";

export function makeMaster(): ResumeServerData {
  return {
    id: "m1",
    userId: "u1",
    title: "Master",
    description: null,
    photoUrl: null,
    colorHex: "#000000",
    borderStyle: "squircle",
    template: "classic",
    summary: "Original summary",
    firstName: "Jane",
    lastName: "Doe",
    jobTitle: "Engineer",
    city: null,
    country: null,
    phone: null,
    email: null,
    isMaster: true,
    isTailored: false,
    hiddenSections: [],
    skills: ["React"],
    workExperiences: [
      {
        id: "w1",
        position: "Developer",
        company: "Acme",
        startDate: null,
        endDate: null,
        description: null,
        bullets: [
          { text: "Built React apps", hidden: false },
          { text: "Organised the office quiz", hidden: false },
        ],
        hidden: false,
        sortOrder: 0,
      },
    ],
    educations: [],
    links: [],
    certifications: [],
    languages: [],
    projects: [
      {
        id: "p1",
        name: "Side project",
        url: null,
        startDate: null,
        endDate: null,
        bullets: [{ text: "Shipped a small tool", hidden: false }],
        hidden: false,
        sortOrder: 0,
      },
    ],
  } as unknown as ResumeServerData;
}

export const noChoices = {
  summary: null,
  hideSections: [],
  hideEntries: [],
  hideBullets: [],
  rewrites: [],
};
