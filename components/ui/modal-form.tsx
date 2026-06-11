"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalFormProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
  widthClassName?: string;
};

export function ModalForm({
  title,
  description,
  trigger,
  children,
  widthClassName,
}: ModalFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {trigger}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-3 sm:items-center">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "relative max-h-[92vh] w-full overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl",
              widthClassName ?? "max-w-2xl"
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] px-5 py-4">
              <div>
                <h2 className="m-0 text-lg font-bold text-[hsl(var(--foreground))]">{title}</h2>
                {description ? (
                  <p className="m-0 mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-[hsl(var(--muted))]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-5">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

