import {
  type FontPair,
  type PageBackground,
  parseFontPair,
  parsePageBackground,
} from "./page-style";
import {
  type PhotoPosition,
  type PhotoShape,
  type PhotoSize,
  parsePhotoPosition,
  parsePhotoShape,
  parsePhotoSize,
} from "./photo-options";
import { type SkillStyle, parseSkillStyle } from "./skill-options";
import type { ResumeValues } from "./validation";

export interface LookValues {
  photoShape: PhotoShape;
  photoPosition: PhotoPosition;
  photoSize: PhotoSize;
  skillsStyle: SkillStyle;
  pageBackground: PageBackground;
  fontPair: FontPair;
}

export interface Look {
  id: string;
  label: string;
  description: string;
  values: LookValues;
}

// The first look is the app default, so a new resume already matches it.
export const looks = [
  {
    id: "professional",
    label: "Professional",
    description: "Plain page, standard fonts, skills as chips.",
    values: {
      photoShape: "squircle",
      photoPosition: "left",
      photoSize: "medium",
      skillsStyle: "chips",
      pageBackground: "plain",
      fontPair: "default",
    },
  },
  {
    id: "creative",
    label: "Creative",
    description: "Tinted page, display fonts, round photo, skill rings.",
    values: {
      photoShape: "circle",
      photoPosition: "left",
      photoSize: "large",
      skillsStyle: "ring",
      pageBackground: "tint",
      fontPair: "display",
    },
  },
  {
    id: "classic",
    label: "Classic",
    description: "Plain page, serif fonts, small square photo on the right.",
    values: {
      photoShape: "square",
      photoPosition: "right",
      photoSize: "small",
      skillsStyle: "list",
      pageBackground: "plain",
      fontPair: "serif",
    },
  },
  {
    id: "bold",
    label: "Bold",
    description: "Side panel, display fonts, large photo, skill bars.",
    values: {
      photoShape: "squircle",
      photoPosition: "right",
      photoSize: "large",
      skillsStyle: "bars",
      pageBackground: "sidebar",
      fontPair: "display",
    },
  },
] as const satisfies readonly Look[];

export type LookId = (typeof looks)[number]["id"];

export function findLook(id: string): Look | undefined {
  return looks.find((look) => look.id === id);
}

// Returns a copy, so a caller can never change the catalogue.
export function lookChanges(id: string): Partial<ResumeValues> | undefined {
  const look = findLook(id);
  return look ? { ...look.values } : undefined;
}

// Only the six look fields count, so a template, colour or skill level
// change never makes the active look disappear.
export function activeLookId(resumeData: ResumeValues): LookId | undefined {
  const current: LookValues = {
    photoShape: parsePhotoShape(resumeData.photoShape, resumeData.borderStyle),
    photoPosition: parsePhotoPosition(resumeData.photoPosition),
    photoSize: parsePhotoSize(resumeData.photoSize),
    skillsStyle: parseSkillStyle(resumeData.skillsStyle),
    pageBackground: parsePageBackground(resumeData.pageBackground),
    fontPair: parseFontPair(resumeData.fontPair),
  };
  return looks.find((look) =>
    (Object.keys(look.values) as (keyof LookValues)[]).every(
      (key) => look.values[key] === current[key],
    ),
  )?.id;
}
