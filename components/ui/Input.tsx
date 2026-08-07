"use client";

import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  hint?: string;
}

/** Label + control wrapper used by every form in the app. */
export function Field({ label, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

const INPUT_CLASSES = [
  "w-full rounded-xl border border-line bg-surface px-4 text-ink",
  "placeholder:text-ink-soft/70",
  "transition-colors duration-150",
  "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15",
].join(" ");

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${INPUT_CLASSES} h-11 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${INPUT_CLASSES} min-h-32 resize-y py-3 leading-relaxed ${className}`}
      {...props}
    />
  );
}

/** Inline error message shown under a field. */
export function FieldError({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium text-bad">{children}</p>;
}
