"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import {
  WorkExperience,
  workExperienceSchema,
  WorkExperienceValues,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GripHorizontal, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import GenerateWorkExperienceButton from "./GenerateWorkExperienceButton";

export default function WorkExperienceForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<WorkExperienceValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      // Default every field to "" so inputs stay controlled even when the
      // loaded work experience has missing/undefined fields
      workExperiences: (resumeData.workExperiences || []).map((exp) => ({
        position: exp?.position || "",
        company: exp?.company || "",
        startDate: exp?.startDate || "",
        endDate: exp?.endDate || "",
        bullets: (exp?.bullets ?? []).map((bullet) => ({
          text: bullet.text,
          hidden: bullet.hidden,
        })),
        hidden: exp?.hidden ?? false,
      })),
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;

      // update resume data
      setResumeData({
        ...resumeData,
        workExperiences: (values.workExperiences ?? [])
          .filter((exp) => exp !== undefined)
          .map((exp) => ({
            ...exp,
            bullets: (exp.bullets ?? []).map((bullet) => ({
              text: bullet?.text ?? "",
              hidden: bullet?.hidden ?? false,
            })),
          })),
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "workExperiences",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id); // active item
      const newIndex = fields.findIndex((field) => field.id === over.id); // move item
      move(oldIndex, newIndex);
      return arrayMove(fields, oldIndex, newIndex);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Work experience</h2>
        <p className="text-sm text-muted-foreground">
          Add as many work experiences as you like.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={fields}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <WorkExperienceItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  position: "",
                  company: "",
                  startDate: "",
                  endDate: "",
                  bullets: [],
                  hidden: false,
                })
              }
            >
              Add work experience
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface BulletRowProps {
  form: UseFormReturn<WorkExperienceValues>;
  index: number;
  bulletIndex: number;
  onRemove: () => void;
}

function BulletRow({ form, index, bulletIndex, onRemove }: BulletRowProps) {
  const path = `workExperiences.${index}.bullets.${bulletIndex}` as const;
  const bulletHidden = useWatch({
    control: form.control,
    name: `${path}.hidden`,
  });

  return (
    <div className="flex items-start gap-1">
      <FormField
        control={form.control}
        name={`${path}.text`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel className="sr-only">Bullet {bulletIndex + 1}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={2}
                className={cn(
                  bulletHidden && "text-muted-foreground line-through",
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-pressed={Boolean(bulletHidden)}
        aria-label={
          bulletHidden
            ? `Show bullet ${bulletIndex + 1}`
            : `Hide bullet ${bulletIndex + 1}`
        }
        onClick={() =>
          form.setValue(`${path}.hidden`, !bulletHidden, { shouldDirty: true })
        }
      >
        {bulletHidden ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove bullet ${bulletIndex + 1}`}
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

interface WorkExperienceItemProps {
  id: string;
  form: UseFormReturn<WorkExperienceValues>;
  index: number;
  remove: (index: number) => void;
}

function WorkExperienceItem({
  id,
  form,
  index,
  remove,
}: WorkExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // @dnd-kit auto-increments an internal counter for aria-describedby, causing
  // a different ID between server and client → hydration mismatch.  Destructure
  // it out so the client render matches the server.
  const { "aria-describedby": _ariaDesc, ...safeAttributes } = attributes;

  const entryHidden = useWatch({
    control: form.control,
    name: `workExperiences.${index}.hidden`,
  });
  const {
    fields: bulletFields,
    append: appendBullet,
    remove: removeBullet,
    replace: replaceBullets,
  } = useFieldArray({
    control: form.control,
    name: `workExperiences.${index}.bullets`,
  });

  function applyGenerated(exp: WorkExperience) {
    const path = `workExperiences.${index}` as const;
    form.setValue(`${path}.position`, exp.position ?? "");
    form.setValue(`${path}.company`, exp.company ?? "");
    form.setValue(`${path}.startDate`, exp.startDate ?? "");
    form.setValue(`${path}.endDate`, exp.endDate ?? "");
    replaceBullets(exp.bullets ?? []);
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-background p-3",
        isDragging && "relative z-50 cursor-grab shadow-xl",
        entryHidden && "opacity-60",
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">
          Work experience {index + 1}
          {entryHidden && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Hidden from this resume
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-pressed={Boolean(entryHidden)}
            aria-label={
              entryHidden
                ? `Show work experience ${index + 1}`
                : `Hide work experience ${index + 1}`
            }
            onClick={() =>
              form.setValue(`workExperiences.${index}.hidden`, !entryHidden, {
                shouldDirty: true,
              })
            }
          >
            {entryHidden ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
          <GripHorizontal
            className="size-5 cursor-grab text-muted-foreground focus:outline-hidden"
            {...safeAttributes}
            {...listeners}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <GenerateWorkExperienceButton onWorkExperienceGenerated={applyGenerated} />
      </div>
      <FormField
        control={form.control}
        name={`workExperiences.${index}.position`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job title</FormLabel>
            <FormControl>
              {/* <Input {...field} autoFocus /> */}
              {field !== undefined && <Input {...field} autoFocus />}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`workExperiences.${index}.company`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              {/* <Input {...field} /> */}
              {field !== undefined && <Input {...field} />}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`workExperiences.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                {/* <Input
                  {...field}
                  type="date"
                  value={field.value?.slice(0, 10)}
                /> */}
                {field !== undefined && (
                  <Input
                    {...field}
                    type="date"
                    value={field.value?.slice(0, 10)}
                    //value={field.value && field.value?.slice(0, 10)}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`workExperiences.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl>
                {/* <Input
                  {...field}
                  type="date"
                  value={field.value?.slice(0, 10)}
                /> */}
                {field !== undefined && (
                  <Input
                    {...field}
                    type="date"
                    value={field.value?.slice(0, 10)}
                    //value={field.value && field.value?.slice(0, 10)}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormDescription>
        Leave <span className="font-semibold">end date</span> empty if you are
        currently working here.
      </FormDescription>
      <div className="space-y-2">
        <p className="text-sm font-medium">Bullet points</p>
        {bulletFields.map((bullet, bulletIndex) => (
          <BulletRow
            key={bullet.id}
            form={form}
            index={index}
            bulletIndex={bulletIndex}
            onRemove={() => removeBullet(bulletIndex)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendBullet({ text: "", hidden: false })}
        >
          <Plus className="size-4" />
          Add bullet
        </Button>
      </div>
      <Button variant="destructive" type="button" onClick={() => remove(index)}>
        Remove
      </Button>
    </div>
  );
}
