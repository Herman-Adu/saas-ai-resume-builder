"use client";

import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import {
  MAX_JOB_POST_CHARS,
  MIN_JOB_POST_CHARS,
  jobTailorMessages,
  type JobAnalysis,
  type JobTailorFailure,
} from "@/lib/job-tailor";
import { Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { analyzeJob, createJobTailoredCopy } from "./jobTailorActions";

export type EntryLabels = Record<string, { label: string; bullets: string[] }>;

interface JobTailorButtonProps {
  canTailor: boolean;
  hasMaster: boolean;
  entryLabels: EntryLabels;
}

const refKey = (kind: string, entryId: string, index: number) =>
  `${kind}:${entryId}:${index}`;

function allSuggestionKeys(analysis: JobAnalysis) {
  return new Set([
    ...(analysis.summary ? ["summary"] : []),
    ...analysis.hideSections.map((section) => `section:${section}`),
    ...analysis.hideEntries.map((id) => `entry:${id}`),
    ...analysis.hideBullets.map((r) => refKey("hide", r.entryId, r.index)),
    ...analysis.rewrites.map((r) => refKey("rewrite", r.entryId, r.index)),
  ]);
}

export default function JobTailorButton({
  canTailor,
  hasMaster,
  entryLabels,
}: JobTailorButtonProps) {
  const premiumModal = usePremiumModal();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [post, setPost] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const postLength = post.trim().length;
  const postValid =
    postLength >= MIN_JOB_POST_CHARS && postLength <= MAX_JOB_POST_CHARS;

  function handleClick() {
    if (!canTailor) {
      premiumModal.setOpen(true);
      return;
    }
    if (!hasMaster) {
      toast({
        variant: "destructive",
        description:
          "Mark one of your resumes as the master first, using its menu.",
      });
      return;
    }
    setOpen(true);
  }

  function handleFailure(code: JobTailorFailure) {
    if (code === "upgrade_required") {
      setOpen(false);
      premiumModal.setOpen(true);
      return;
    }
    toast({ variant: "destructive", description: jobTailorMessages[code] });
  }

  function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await analyzeJob({ title, company, post });
      if (!result.ok) return handleFailure(result.code);
      setAnalysis(result.analysis);
      setAccepted(allSuggestionKeys(result.analysis));
    });
  }

  function toggle(key: string) {
    setAccepted((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleCreate() {
    if (!analysis) return;
    startTransition(async () => {
      const result = await createJobTailoredCopy({
        title,
        company,
        post,
        accepted: {
          summary: accepted.has("summary") ? analysis.summary : null,
          hideSections: analysis.hideSections.filter((s) =>
            accepted.has(`section:${s}`),
          ),
          hideEntries: analysis.hideEntries.filter((id) =>
            accepted.has(`entry:${id}`),
          ),
          hideBullets: analysis.hideBullets.filter((r) =>
            accepted.has(refKey("hide", r.entryId, r.index)),
          ),
          rewrites: analysis.rewrites.filter((r) =>
            accepted.has(refKey("rewrite", r.entryId, r.index)),
          ),
        },
      });
      if (!result.ok) return handleFailure(result.code);
      setOpen(false);
      setAnalysis(null);
      setPost("");
      router.push(`/editor?resumeId=${result.id}`);
    });
  }

  function choice(id: string, children: React.ReactNode) {
    return (
      <label key={id} className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-4"
          checked={accepted.has(id)}
          onChange={() => toggle(id)}
        />
        <span>{children}</span>
      </label>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={handleClick} className="gap-2">
        <Target className="size-5" aria-hidden />
        Tailor to a job
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {!analysis ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Tailor to a job</DialogTitle>
                <DialogDescription>
                  Paste the job post. We suggest what to hide and reword in a
                  copy of your master. You choose what to keep, and nothing is
                  added that is not already in your CV. Your CV and the post are
                  sent to our AI provider to produce the suggestions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job title (optional)</Label>
                  <Input
                    id="job-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-company">Company (optional)</Label>
                  <Input
                    id="job-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    maxLength={120}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-post">Job post</Label>
                <Textarea
                  id="job-post"
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  rows={10}
                  placeholder="Paste the full job description here"
                />
                <p className="text-xs text-muted-foreground">
                  {postLength.toLocaleString("en-GB")} /{" "}
                  {MAX_JOB_POST_CHARS.toLocaleString("en-GB")} characters, at
                  least {MIN_JOB_POST_CHARS}.
                </p>
              </div>
              <DialogFooter>
                <LoadingButton
                  type="submit"
                  loading={isPending}
                  disabled={!postValid}
                >
                  Analyse job
                </LoadingButton>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle>Review suggestions</DialogTitle>
                <DialogDescription>{analysis.roleSummary}</DialogDescription>
              </DialogHeader>

              <p className="text-sm">
                Match score:{" "}
                <strong data-testid="match-score">{analysis.matchScore}</strong>
                /100
              </p>

              <section aria-labelledby="matched-heading" className="space-y-1">
                <h3 id="matched-heading" className="text-sm font-semibold">
                  Already in your CV
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.matched.join(", ") || "Nothing matched clearly."}
                </p>
              </section>

              <section aria-labelledby="gaps-heading" className="space-y-1">
                <h3 id="gaps-heading" className="text-sm font-semibold">
                  Gaps (not added to your CV)
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.gaps.join(", ") || "No clear gaps."}
                </p>
              </section>

              <section aria-labelledby="changes-heading" className="space-y-3">
                <h3 id="changes-heading" className="text-sm font-semibold">
                  Suggested changes
                </h3>
                {analysis.summary &&
                  choice("summary", <>Use this summary: {analysis.summary}</>)}
                {analysis.hideSections.map((section) =>
                  choice(`section:${section}`, <>Hide the {section} section</>),
                )}
                {analysis.hideEntries.map((id) =>
                  choice(
                    `entry:${id}`,
                    <>Hide {entryLabels[id]?.label ?? "an entry"}</>,
                  ),
                )}
                {analysis.hideBullets.map((ref) =>
                  choice(
                    refKey("hide", ref.entryId, ref.index),
                    <>
                      Hide bullet &ldquo;
                      {entryLabels[ref.entryId]?.bullets[ref.index]}&rdquo; (
                      {entryLabels[ref.entryId]?.label})
                    </>,
                  ),
                )}
                {analysis.rewrites.map((ref) =>
                  choice(
                    refKey("rewrite", ref.entryId, ref.index),
                    <>
                      Reword &ldquo;
                      {entryLabels[ref.entryId]?.bullets[ref.index]}&rdquo; as
                      &ldquo;{ref.text}&rdquo;
                    </>,
                  ),
                )}
              </section>

              <DialogFooter>
                <LoadingButton loading={isPending} onClick={handleCreate}>
                  Create tailored copy
                </LoadingButton>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAnalysis(null)}
                >
                  Back
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
