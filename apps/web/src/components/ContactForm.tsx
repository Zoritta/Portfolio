"use client";

import { useState, type FormEvent } from "react";
import { sendContactMessage, ContactError } from "@/lib/api";

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const trimmedMessageLength = message.trim().length;
  const isValid =
    name.trim().length >= 2 &&
    EMAIL_PATTERN.test(email.trim()) &&
    trimmedMessageLength >= MIN_MESSAGE_LENGTH &&
    trimmedMessageLength <= MAX_MESSAGE_LENGTH;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      await sendContactMessage({ name, email, message, honeypot });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const errorMessage =
        err instanceof ContactError ? err.message : "Something went wrong sending your message.";
      setError(errorMessage);
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Contact</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Have a role or project in mind? Send a message and I&apos;ll get back to you.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
            className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Your message…"
          rows={5}
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />

        {/* Honeypot: hidden off-screen via CSS rather than type="hidden" (bots specifically skip
            hidden inputs, but still fill in anything that looks like a normal visible field). */}
        <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Leave this field empty
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {trimmedMessageLength} / {MAX_MESSAGE_LENGTH} characters (min {MIN_MESSAGE_LENGTH})
          </span>
          <button
            type="submit"
            disabled={!isValid || status === "loading"}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black"
          >
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>
        </div>
      </form>

      {status === "error" && error && (
        <p className="mt-4 animate-[fade-in_0.3s_ease-out] rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          {error}
        </p>
      )}

      {status === "success" && (
        <p className="mt-4 animate-[fade-in_0.4s_ease-out] rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
          Thanks — your message has been sent. I&apos;ll get back to you soon.
        </p>
      )}
    </section>
  );
}
