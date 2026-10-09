"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import {
  mentorBriefMessages,
  type MentorBrief,
  type MentorBriefFailure,
} from "@/lib/mentor-brief";
import { Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { generateMentorBrief } from "../../mentorBriefActions";

interface MentorBriefViewProps {
  resumeId: string;
  initialBrief: MentorBrief | null;
  canWrite: boolean;
}

const sections: {
  key: keyof MentorBrief;
  title: string;
  empty: string;
}[] = [
  {
    key: "roleTests",
    title: "What this role will test",
    empty: "Nothing specific came up.",
  },
  {
    key: "cvGaps",
    title: "Where your CV is thin against the post",
    empty: "Your CV already covers what the post asks for.",
  },
  {
    key: "brushUp",
    title: "What to revise before you interview",
    empty: "Nothing specific came up.",
  },
];

export default function MentorBriefView({
  resumeId,
  initialBrief,
  canWrite,
}: MentorBriefViewProps) {
  const { toast } = useToast();
  const [brief, setBrief] = useState(initialBrief);
  const [isGenerating, startGenerating] = useTransition();

  function showFailure(code: MentorBriefFailure) {
    toast({ variant: "destructive", description: mentorBriefMessages[code] });
  }

  function handleGenerate() {
    startGenerating(async () => {
      const result = await generateMentorBrief(resumeId);
      if (!result.ok) return showFailure(result.code);
      setBrief(result.brief);
    });
  }

  return (
    <div className="space-y-6">
      {!canWrite && (
        <p
          role="status"
          className="rounded-md border p-3 text-sm text-muted-foreground"
        >
          {mentorBriefMessages.upgrade_required}
        </p>
      )}
      <div className="space-y-2">
        <LoadingButton
          type="button"
          loading={isGenerating}
          disabled={!canWrite}
          onClick={handleGenerate}
        >
          <Sparkles className="mr-2 size-4" />
          {brief ? "Refresh brief" : "Write mentor brief"}
        </LoadingButton>
        <p className="text-xs text-muted-foreground">
          Written from your resume and the job post only. It never changes your
          resume, and it is a preparation aid, not a prediction.
        </p>
      </div>
      {brief ? (
        <div className="space-y-6">
          {sections.map(({ key, title, empty }) => (
            <section key={key} className="space-y-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              {brief[key].length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                  {brief[key].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{empty}</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No brief yet. Write one to see what this role is likely to test.
        </p>
      )}
    </div>
  );
}
