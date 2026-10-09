import { SubscriptionLevel } from "./subscription";
import {
  defaultTemplate,
  isResumeTemplate,
  type ResumeTemplate,
} from "./templates";

export function canCreateResume(
  subscriptionLevel: SubscriptionLevel,
  currentResumeCount: number,
) {
  // this is sbetter organised than using an if statement if anything changes, new plan, counts etc its added only here
  //free members get 1 resume
  const maxResumeMap: Record<SubscriptionLevel, number> = {
    free: 1,
    pro: 3,
    pro_plus: Infinity,
  };

  // get value of maxReumesMap for rsubscription level
  const maxResumes = maxResumeMap[subscriptionLevel];

  // if resume count is less than the max your are allowed the user can create resume
  return currentResumeCount < maxResumes;
}

// Tailored copies are counted apart from base resumes: one per job application
// would hit the base cap straight away. Free cannot tailor.
export const tailoredResumeLimits: Record<SubscriptionLevel, number> = {
  free: 0,
  pro: 10,
  pro_plus: Infinity,
};

export function canTailor(subscriptionLevel: SubscriptionLevel) {
  return tailoredResumeLimits[subscriptionLevel] > 0;
}

export function canCreateTailoredResume(
  subscriptionLevel: SubscriptionLevel,
  currentTailoredCount: number,
) {
  return currentTailoredCount < tailoredResumeLimits[subscriptionLevel];
}

// onlu pro and pro plus members can use AI models
export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel !== "free";
}

export const cvImportDailyLimit = 10;

// Importing a CV runs the AI, so it follows the same plans as the AI tools.
export function canImportCv(subscriptionLevel: SubscriptionLevel) {
  return canUseAITools(subscriptionLevel);
}

export function canImportCvToday(importsInLastDay: number) {
  return importsInLastDay < cvImportDailyLimit;
}

export function cvImportWindowStart(now: Date = new Date()) {
  return new Date(now.getTime() - 24 * 60 * 60 * 1000);
}

// Runs of the "tailor to a job" AI a day. Pro Plus is capped rather than
// unlimited so AI cost cannot run away.
export const jobTailorDailyLimits: Record<SubscriptionLevel, number> = {
  free: 0,
  pro: 5,
  pro_plus: 30,
};

export function canTailorToJob(subscriptionLevel: SubscriptionLevel) {
  return canUseAITools(subscriptionLevel) && canTailor(subscriptionLevel);
}

export function canTailorToJobToday(
  subscriptionLevel: SubscriptionLevel,
  runsInLastDay: number,
) {
  return runsInLastDay < jobTailorDailyLimits[subscriptionLevel];
}

// Classic is free for everyone; the other templates need a paid plan.
export function canUseTemplate(
  subscriptionLevel: SubscriptionLevel,
  template: ResumeTemplate,
) {
  return template === defaultTemplate || subscriptionLevel !== "free";
}

// A template picked on the public gallery only applies when this plan may
// save it, so the first autosave is never refused.
export function startingTemplate(
  requested: string | undefined,
  subscriptionLevel: SubscriptionLevel,
): ResumeTemplate | undefined {
  return isResumeTemplate(requested) &&
    canUseTemplate(subscriptionLevel, requested)
    ? requested
    : undefined;
}

// only pro plus members can use customizations
export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel === "pro_plus";
}
