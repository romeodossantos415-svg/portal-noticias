"use client";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      {title && <div className="px-5 py-3 border-b border-slate-200 font-semibold text-sm">{title}</div>}
      <div className="p-5">{children}</div>
    </div>
  );
}

const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-700",
  secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-slate-600 hover:bg-slate-100",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
};
export type BtnVariant = keyof typeof variants;

export function Button({ variant = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button className={cn(btnBase, variants[variant], className)} {...p} />;
}

export function SubmitButton({ children, variant = "primary", pendingText = "Salvando…", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(btnBase, variants[variant], className)} {...p}>
      {pending ? pendingText : children}
    </button>
  );
}

export function LinkButton({ href, variant = "primary", className = "", children, ...p }: { href: string; variant?: BtnVariant; className?: string; children: React.ReactNode } & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(btnBase, variants[variant], className)} {...p}>
      {children}
    </Link>
  );
}

export const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-sm", className)}>
      <span className="font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(inputCls, p.className)} />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(inputCls, "min-h-24", p.className)} />;
}
export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn(inputCls, p.className)} />;
}
export function Checkbox({ label, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" {...p} className="h-4 w-4 rounded border-slate-300" />
      {label}
    </label>
  );
}

export function Alert({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  const cls = { info: "bg-blue-50 border-blue-200 text-blue-800", error: "bg-red-50 border-red-200 text-red-700", success: "bg-emerald-50 border-emerald-200 text-emerald-800" }[kind];
  return <div className={cn("text-sm border rounded-lg px-3 py-2", cls)}>{children}</div>;
}

export function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
  };
  return <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", map[color] ?? map.slate)}>{children}</span>;
}

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export const thCls = "text-left text-xs uppercase tracking-wider text-slate-500 font-medium px-4 py-3 border-b border-slate-200 bg-slate-50";
export const tdCls = "px-4 py-3 border-b border-slate-100 align-middle";

export function ConfirmButton({ message = "Tem certeza?", children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { message?: string; variant?: BtnVariant }) {
  const { variant = "danger", className = "", ...rest } = p;
  return (
    <button
      {...rest}
      className={cn(btnBase, variants[variant], className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
