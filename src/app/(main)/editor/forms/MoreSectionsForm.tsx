"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EditorFormProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  certificationsSchema,
  languagesSchema,
  linksSchema,
  projectsSchema,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { useEffect } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";
import BulletRowShell from "./BulletRowShell";
import SectionVisibilityToggle from "../SectionVisibilityToggle";

const moreSectionsSchema = linksSchema
  .extend(certificationsSchema.shape)
  .extend(languagesSchema.shape)
  .extend(projectsSchema.shape);

type MoreSectionsValues = z.input<typeof moreSectionsSchema>;
type Form = UseFormReturn<MoreSectionsValues>;
type FieldName = FieldPath<MoreSectionsValues>;

export default function MoreSectionsForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<MoreSectionsValues>({
    resolver: zodResolver(moreSectionsSchema),
    defaultValues: {
      links: (resumeData.links ?? []).map((link) => ({
        label: link?.label || "",
        url: link?.url || "",
        hidden: link?.hidden ?? false,
      })),
      certifications: (resumeData.certifications ?? []).map((cert) => ({
        name: cert?.name || "",
        issuer: cert?.issuer || "",
        issuedDate: cert?.issuedDate || "",
        url: cert?.url || "",
        hidden: cert?.hidden ?? false,
      })),
      languages: (resumeData.languages ?? []).map((language) => ({
        name: language?.name || "",
        level: language?.level || "",
        hidden: language?.hidden ?? false,
      })),
      projects: (resumeData.projects ?? []).map((project) => ({
        name: project?.name || "",
        url: project?.url || "",
        startDate: project?.startDate || "",
        endDate: project?.endDate || "",
        bullets: (project?.bullets ?? []).map((bullet) => ({
          text: bullet.text,
          hidden: bullet.hidden,
        })),
        hidden: project?.hidden ?? false,
      })),
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;

      setResumeData({
        ...resumeData,
        links: (values.links ?? []).filter((entry) => entry !== undefined),
        certifications: (values.certifications ?? []).filter(
          (entry) => entry !== undefined,
        ),
        languages: (values.languages ?? []).filter(
          (entry) => entry !== undefined,
        ),
        projects: (values.projects ?? [])
          .filter((entry) => entry !== undefined)
          .map((project) => ({
            ...project,
            bullets: (project.bullets ?? []).map((bullet) => ({
              text: bullet?.text ?? "",
              hidden: bullet?.hidden ?? false,
            })),
          })),
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const links = useFieldArray({ control: form.control, name: "links" });
  const certifications = useFieldArray({
    control: form.control,
    name: "certifications",
  });
  const languages = useFieldArray({ control: form.control, name: "languages" });
  const projects = useFieldArray({ control: form.control, name: "projects" });

  const sectionProps = { resumeData, setResumeData };

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">More sections</h2>
        <p className="text-sm text-muted-foreground">
          Add links, certifications, languages and projects. Hide anything you
          do not want on this resume.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-10">
          <SectionBlock
            title="Links"
            addLabel="Add link"
            section="links"
            sectionLabel="links"
            onAdd={() => links.append({ label: "", url: "", hidden: false })}
            {...sectionProps}
          >
            {links.fields.map((field, index) => (
              <EntryShell
                key={field.id}
                form={form}
                name="links"
                entryLabel="link"
                index={index}
                count={links.fields.length}
                move={links.move}
                remove={links.remove}
              >
                <TextField form={form} name={`links.${index}.label`} label="Label" />
                <TextField form={form} name={`links.${index}.url`} label="Address" />
              </EntryShell>
            ))}
          </SectionBlock>

          <SectionBlock
            title="Certifications"
            addLabel="Add certification"
            section="certifications"
            sectionLabel="certifications"
            onAdd={() =>
              certifications.append({
                name: "",
                issuer: "",
                issuedDate: "",
                url: "",
                hidden: false,
              })
            }
            {...sectionProps}
          >
            {certifications.fields.map((field, index) => (
              <EntryShell
                key={field.id}
                form={form}
                name="certifications"
                entryLabel="certification"
                index={index}
                count={certifications.fields.length}
                move={certifications.move}
                remove={certifications.remove}
              >
                <TextField form={form} name={`certifications.${index}.name`} label="Name" />
                <TextField form={form} name={`certifications.${index}.issuer`} label="Issuer" />
                <TextField form={form} name={`certifications.${index}.issuedDate`} label="Issued" type="date" />
                <TextField form={form} name={`certifications.${index}.url`} label="Address" />
              </EntryShell>
            ))}
          </SectionBlock>

          <SectionBlock
            title="Languages"
            addLabel="Add language"
            section="languages"
            sectionLabel="languages"
            onAdd={() => languages.append({ name: "", level: "", hidden: false })}
            {...sectionProps}
          >
            {languages.fields.map((field, index) => (
              <EntryShell
                key={field.id}
                form={form}
                name="languages"
                entryLabel="language"
                index={index}
                count={languages.fields.length}
                move={languages.move}
                remove={languages.remove}
              >
                <TextField form={form} name={`languages.${index}.name`} label="Language" />
                <TextField form={form} name={`languages.${index}.level`} label="Level" />
              </EntryShell>
            ))}
          </SectionBlock>

          <SectionBlock
            title="Projects"
            addLabel="Add project"
            section="projects"
            sectionLabel="projects"
            onAdd={() =>
              projects.append({
                name: "",
                url: "",
                startDate: "",
                endDate: "",
                bullets: [],
                hidden: false,
              })
            }
            {...sectionProps}
          >
            {projects.fields.map((field, index) => (
              <EntryShell
                key={field.id}
                form={form}
                name="projects"
                entryLabel="project"
                index={index}
                count={projects.fields.length}
                move={projects.move}
                remove={projects.remove}
              >
                <TextField form={form} name={`projects.${index}.name`} label="Name" />
                <TextField form={form} name={`projects.${index}.url`} label="Address" />
                <div className="grid grid-cols-2 gap-3">
                  <TextField form={form} name={`projects.${index}.startDate`} label="Start date" type="date" />
                  <TextField form={form} name={`projects.${index}.endDate`} label="End date" type="date" />
                </div>
                <ProjectBullets form={form} index={index} />
              </EntryShell>
            ))}
          </SectionBlock>
        </form>
      </Form>
    </div>
  );
}

interface SectionBlockProps
  extends Pick<EditorFormProps, "resumeData" | "setResumeData"> {
  title: string;
  addLabel: string;
  section: "links" | "certifications" | "languages" | "projects";
  sectionLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}

function SectionBlock({
  title,
  addLabel,
  section,
  sectionLabel,
  onAdd,
  children,
  resumeData,
  setResumeData,
}: SectionBlockProps) {
  return (
    <section aria-label={title} className="space-y-3">
      <div className="space-y-1.5 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <SectionVisibilityToggle
          section={section}
          label={sectionLabel}
          resumeData={resumeData}
          setResumeData={setResumeData}
        />
      </div>
      {children}
      <div className="flex justify-center">
        <Button type="button" onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </section>
  );
}

type ArrayName = "links" | "certifications" | "languages" | "projects";

interface EntryShellProps {
  form: Form;
  name: ArrayName;
  entryLabel: string;
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  remove: (index: number) => void;
  children: React.ReactNode;
}

function EntryShell({
  form,
  name,
  entryLabel,
  index,
  count,
  move,
  remove,
  children,
}: EntryShellProps) {
  const hidden = Boolean(
    useWatch({ control: form.control, name: `${name}.${index}.hidden` }),
  );
  const position = index + 1;

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-background p-3",
        hidden && "opacity-60",
      )}
    >
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Move ${entryLabel} ${position} up`}
          disabled={index === 0}
          onClick={() => move(index, index - 1)}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Move ${entryLabel} ${position} down`}
          disabled={index === count - 1}
          onClick={() => move(index, index + 1)}
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-pressed={hidden}
          aria-label={
            hidden
              ? `Show ${entryLabel} ${position}`
              : `Hide ${entryLabel} ${position}`
          }
          onClick={() =>
            form.setValue(`${name}.${index}.hidden`, !hidden, {
              shouldDirty: true,
            })
          }
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove ${entryLabel} ${position}`}
          onClick={() => remove(index)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}

interface TextFieldProps {
  form: Form;
  name: FieldName;
  label: string;
  type?: "text" | "date";
}

function TextField({ form, name, label, type = "text" }: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              value={typeof field.value === "string" ? field.value : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ProjectBullets({ form, index }: { form: Form; index: number }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `projects.${index}.bullets`,
  });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Bullet points</p>
      {fields.map((field, bulletIndex) => (
        <ProjectBulletRow
          key={field.id}
          form={form}
          index={index}
          bulletIndex={bulletIndex}
          onRemove={() => remove(bulletIndex)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ text: "", hidden: false })}
      >
        Add bullet
      </Button>
    </div>
  );
}

interface ProjectBulletRowProps {
  form: Form;
  index: number;
  bulletIndex: number;
  onRemove: () => void;
}

function ProjectBulletRow({
  form,
  index,
  bulletIndex,
  onRemove,
}: ProjectBulletRowProps) {
  const path = `projects.${index}.bullets.${bulletIndex}` as const;
  const hidden = Boolean(useWatch({ control: form.control, name: `${path}.hidden` }));

  return (
    <BulletRowShell
      bulletIndex={bulletIndex}
      hidden={hidden}
      onToggleHidden={() =>
        form.setValue(`${path}.hidden`, !hidden, { shouldDirty: true })
      }
      onRemove={onRemove}
    >
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
                className={cn(hidden && "text-muted-foreground line-through")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </BulletRowShell>
  );
}
