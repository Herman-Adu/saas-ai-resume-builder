import { SubscriptionLevel } from "./subscription";

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

// onlu pro and pro plus members can use AI models
export function canUseAITools(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel !== "free";
}

// only pro plus members can use customizations
export function canUseCustomizations(subscriptionLevel: SubscriptionLevel) {
  return subscriptionLevel === "pro_plus";
}
