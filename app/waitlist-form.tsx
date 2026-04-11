"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state === "loading") {
      return;
    }

    const trimmedEmail = email.trim();

    if (!emailPattern.test(trimmedEmail)) {
      setState("error");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: trimmedEmail })
      });

      if (!response.ok) {
        setState("error");
        return;
      }

      setEmail("");
      setState("success");
    } catch {
      setState("error");
    }
  }

  const isLoading = state === "loading";

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="email">
        Email address
      </label>
      <div className="formRow">
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "idle" && state !== "loading") {
              setState("idle");
            }
          }}
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Joining..." : "Join waitlist"}
        </button>
      </div>
      <div className="messageSlot" aria-live="polite">
        {state === "success" ? (
          <p className="message successMessage">
            <span className="successCheck">✓</span>
            You’re on the list.
          </p>
        ) : null}
        {state === "error" ? (
          <p className="message errorMessage">Something went wrong. Try again.</p>
        ) : null}
      </div>
    </form>
  );
}
