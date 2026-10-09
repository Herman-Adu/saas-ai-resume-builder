"use client";

import { Input } from "@/components/ui/input";
import { canUseCustomizations } from "@/lib/permissions";
import { parseSkillLevel, parseSkillLevels } from "@/lib/skill-options";
import { EditorFormProps } from "@/lib/types";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";

export default function SkillLevelFields({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const canEdit = canUseCustomizations(subscriptionLevel);
  const skills = [...new Set(resumeData.skills ?? [])];
  const levels = parseSkillLevels(resumeData.skillLevels);

  if (skills.length === 0) return null;

  function setLevel(skill: string, raw: string) {
    const level = parseSkillLevel(raw);
    const next = Object.fromEntries(
      Object.entries(levels).filter(([name]) => name !== skill),
    );
    setResumeData({
      ...resumeData,
      skillLevels: level === undefined ? next : { ...next, [skill]: level },
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Skill levels (optional)</legend>
      <p className="text-sm text-muted-foreground">
        {canEdit
          ? "Add a percentage to show a skill as a chart. Works best for technical CVs; leave it empty and the skill stays a plain label."
          : "Skill levels and charts are part of the Pro Plus plan."}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {skills.map((skill) => (
          <li key={skill} className="flex items-center gap-2">
            <label
              htmlFor={`skill-level-${skill}`}
              className="min-w-0 flex-1 truncate text-sm"
            >
              {skill}
            </label>
            <Input
              id={`skill-level-${skill}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={5}
              placeholder="%"
              disabled={!canEdit}
              className="w-20"
              value={levels[skill] ?? ""}
              onChange={(event) => setLevel(skill, event.target.value)}
            />
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
