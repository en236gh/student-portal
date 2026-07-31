"use client";

import { AuthSplit } from "@/components/auth/AuthSplit";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { activateAccount } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const [computerNumber, setComputerNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await activateAccount({
        computerNumber,
        nationalId,
        password,
        confirmPassword,
      });

      toast.success(result.message || "Account activated. You can sign in now.");
      router.replace("/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to activate account.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplit>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Activate Student Account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Students cannot self-register. Activate using your computer number and
        national ID (NRC) already on record.
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

        <Field label="National ID (NRC)" htmlFor="nationalId">
          <Input
            id="nationalId"
            auth
            autoComplete="off"
            placeholder="1234567891"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password" hint="At least 8 characters">
          <Input
            id="password"
            auth
            type="password"
            autoComplete="new-password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            auth
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>

        {error ? <p className="text-sm text-brand-red">{error}</p> : null}

        <Button type="submit" className="h-11 w-full !rounded-none" disabled={loading}>
          {loading ? "Activating…" : "Activate account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already activated?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplit>
  );
}
