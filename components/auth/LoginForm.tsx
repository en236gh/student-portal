"use client";

import { AuthSplit } from "@/components/auth/AuthSplit";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loginStudent } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [computerNumber, setComputerNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginStudent({ computerNumber, password });
      saveSession(
        result.data.accessToken,
        result.data.refreshToken,
        result.data.profile,
      );
      toast.success("Signed in successfully");
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplit>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Sign in As Student
      </h1>
      <p className="mt-2 text-sm text-muted">
        Use your computer number and password to access the examination portal.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field label="Computer number" htmlFor="computerNumber">
          <Input
            id="computerNumber"
            auth
            inputMode="numeric"
            autoComplete="username"
            placeholder="2022004265"
            value={computerNumber}
            onChange={(e) => setComputerNumber(e.target.value)}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            auth
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        {error ? <p className="text-sm text-brand-red">{error}</p> : null}

        <Button type="submit" className="h-11 w-full !rounded-none" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        First time here?{" "}
        <Link href="/signup" className="font-medium text-ink underline-offset-2 hover:underline">
          Activate your account
        </Link>
      </p>
    </AuthSplit>
  );
}
