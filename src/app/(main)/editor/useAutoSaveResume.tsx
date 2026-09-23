import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { ResumeValues } from "@/lib/validation";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveResume } from "./actions";
import { Button } from "@/components/ui/button";
import { fileReplacer } from "@/lib/utils";

// Debounce period before retrying a failed save
const ERROR_RETRY_MS = 5000;

export default function useAutoSaveResume(resumeData: ResumeValues) {
  const searchParams = useSearchParams();

  const { toast } = useToast();

  // ise debounce hook
  const debouncedResumeData = useDebounce(resumeData, 1500);

  const [resumeId, setResumeId] = useState(resumeData.id);

  // create a deep clone of existing resume data
  const [lastSavedData, setLastSavedData] = useState(
    structuredClone(resumeData),
  );

  const [isSaving, setIsSaving] = useState(false);

  // Track last error time with a ref to avoid setState-in-effect anti-pattern
  const lastErrorTime = useRef(0);

  // trigger the save
  useEffect(() => {
    async function save() {
      try {
        setIsSaving(true);

        //  create a const new data and assign it to a structured clone of the debounced resume data
        const newData = structuredClone(debouncedResumeData);

        // call our server action to save the resume
        const updatedResume = await saveResume({
          ...newData,
          ...(JSON.stringify(lastSavedData.photo, fileReplacer) ===
            JSON.stringify(newData.photo, fileReplacer) && {
            photo: undefined,
          }),
          id: resumeId,
        });

        setResumeId(updatedResume.id);
        setLastSavedData(newData);

        if (searchParams.get("resumeId") !== updatedResume.id) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("resumeId", updatedResume.id);

          window.history.replaceState(
            null,
            "",
            `?${newSearchParams.toString()}`,
          );
        }
      } catch (error) {
        lastErrorTime.current = Date.now();
        console.error(error);

        const { dismiss } = toast({
          variant: "destructive",
          description: (
            <div className="space-y-3">
              <p>Could not save changes.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  lastErrorTime.current = 0;
                  dismiss();
                  save();
                }}
              >
                Retry
              </Button>
            </div>
          ),
        });
      } finally {
        setIsSaving(false);
      }
    }

    const hasUnsavedChanges =
      JSON.stringify(debouncedResumeData, fileReplacer) !==
      JSON.stringify(lastSavedData, fileReplacer);

    const canRetry =
      Date.now() - lastErrorTime.current > ERROR_RETRY_MS;

    if (hasUnsavedChanges && debouncedResumeData && !isSaving && canRetry) {
      save();
    }
  }, [
    debouncedResumeData,
    isSaving,
    lastSavedData,
    resumeId,
    searchParams,
    toast,
  ]);

  return {
    isSaving,
    hasUnsavedChanges:
      JSON.stringify(resumeData) !== JSON.stringify(lastSavedData),
  };
}
