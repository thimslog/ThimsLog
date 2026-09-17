"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, Loader2, CheckCircle2, LifeBuoy } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function CreateTicketPage() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter a subject for your ticket");
      return;
    }

    if (!message.trim()) {
      toast.error("Please provide a detailed message describing your issue");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          priority,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create support ticket");
      }

      toast.success("Support ticket submitted successfully!");
      router.push(`/dashboard/help-center/tickets/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong while submitting ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/help-center/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to My Tickets</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Open Ticket
          </h1>
        </div>
      </div>

      {/* Main Open Ticket Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200/90 dark:border-white/10 p-6 sm:p-9 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2 space-y-2">
              <label
                htmlFor="ticket-subject"
                className="block text-[13.5px] font-bold text-slate-900 dark:text-slate-100"
              >
                Subject
              </label>
              <input
                id="ticket-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Issue with account delivery or wallet balance"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="ticket-priority"
                className="block text-[13.5px] font-bold text-slate-900 dark:text-slate-100"
              >
                Priority
              </label>
              <div className="relative">
                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0b101b] text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all cursor-pointer"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="ticket-message"
              className="block text-[13.5px] font-bold text-slate-900 dark:text-slate-100"
            >
              Message
            </label>
            <textarea
              id="ticket-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all resize-y min-h-[140px]"
              required
            />
          </div>

          {/* Bottom Action Section */}
          <div className="pt-3 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-bold shadow-md shadow-[#7c3aed]/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              <span>{submitting ? "Submitting..." : "Submit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
