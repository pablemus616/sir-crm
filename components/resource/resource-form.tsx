"use client";

import { useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TypeOf, ZodType } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useList } from "@/lib/api/hooks";
import { toSpanishError } from "@/lib/api/error-message";
import type { FieldConfig } from "./field-config";

type RhfField = {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  name: string;
};

/**
 * Sub-component: fetches options from an endpoint and renders a Select.
 * Isolated into its own component so `useList` is always called consistently
 * (hooks cannot be called conditionally or in a loop with varying endpoints).
 * Mirrors the DynamicSelectFilter pattern in resource-filters.tsx.
 */
function DynamicSelectField({
  field,
  rhf,
}: {
  field: FieldConfig;
  rhf: RhfField;
}) {
  const getLabel =
    field.optionLabel ?? ((item: unknown) => (item as { name: string }).name);
  const getValue =
    field.optionValue ?? ((item: unknown) => (item as { id: number }).id);

  const query = useList<unknown>(field.optionsEndpoint!, { limit: 100 });
  const options = (query.data?.items ?? []).map((item) => ({
    label: getLabel(item),
    value: String(getValue(item)),
  }));

  const id = field.name;
  return (
    <Select
      value={rhf.value != null ? String(rhf.value) : ""}
      onValueChange={(value) => rhf.onChange(value)}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={field.placeholder ?? "Seleccionar…"} />
      </SelectTrigger>
      <SelectContent>
        {query.isLoading ? (
          <SelectItem value="__loading__" disabled>
            Cargando…
          </SelectItem>
        ) : (
          options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

export interface ResourceFormProps<S extends ZodType> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  schema: S;
  fields: FieldConfig[];
  defaultValues: DefaultValues<TypeOf<S>>;
  submitLabel?: string;
  container?: "dialog" | "sheet";
  onSubmit: (values: TypeOf<S>) => Promise<void>;
}

export function ResourceForm<S extends ZodType>({
  open,
  onOpenChange,
  title,
  schema,
  fields,
  defaultValues,
  submitLabel = "Guardar",
  container = "dialog",
  onSubmit,
}: ResourceFormProps<S>) {
  const form = useForm<TypeOf<S>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function handleSubmit(values: TypeOf<S>) {
    try {
      await onSubmit(values);
      onOpenChange(false);
      form.reset(defaultValues);
    } catch (err) {
      toast.error(toSpanishError(err, "No se pudo guardar."));
    }
  }

  const body = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as never}
            render={({ field: rhf }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "select" && field.optionsEndpoint ? (
                    <DynamicSelectField field={field} rhf={rhf} />
                  ) : (
                    renderControl(field, rhf)
                  )}
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (container === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{body}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

function renderControl(field: FieldConfig, rhf: RhfField) {
  const id = field.name;
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={id}
          placeholder={field.placeholder}
          value={(rhf.value as string) ?? ""}
          onChange={rhf.onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          onBlur={rhf.onBlur}
        />
      );
    case "switch":
      return (
        <Switch
          id={id}
          checked={Boolean(rhf.value)}
          onCheckedChange={(checked) => rhf.onChange(checked)}
        />
      );
    case "select":
      return (
        <Select
          value={rhf.value != null ? String(rhf.value) : ""}
          onValueChange={(value) => rhf.onChange(value)}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={field.placeholder ?? "Seleccionar…"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={(rhf.value as string) ?? ""}
          onChange={rhf.onChange as React.ChangeEventHandler<HTMLInputElement>}
          onBlur={rhf.onBlur}
        />
      );
    case "number":
      return (
        <Input
          id={id}
          type="number"
          placeholder={field.placeholder}
          value={(rhf.value as number | string) ?? ""}
          onChange={(e) => rhf.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          onBlur={rhf.onBlur}
        />
      );
    default:
      return (
        <Input
          id={id}
          type={field.type === "email" ? "email" : "text"}
          placeholder={field.placeholder}
          value={(rhf.value as string) ?? ""}
          onChange={rhf.onChange as React.ChangeEventHandler<HTMLInputElement>}
          onBlur={rhf.onBlur}
        />
      );
  }
}
