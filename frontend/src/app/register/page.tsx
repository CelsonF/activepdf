"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { StepIndicator } from "@/components/auth/register/StepIndicator";
import { CredentialsStep } from "@/components/auth/register/CredentialsStep";
import { RoleStep } from "@/components/auth/register/RoleStep";
import { TeacherOrgStep } from "@/components/auth/register/TeacherOrgStep";
import { StudentGoalsStep } from "@/components/auth/register/StudentGoalsStep";
import { stepLabels, type Goal, type Level, type Role } from "@/components/auth/register/register-data";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 0 — account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");

  // Step 1 — role
  const [role, setRole] = useState<Role | null>(null);

  // Step 2 teacher — org
  const [orgName, setOrgName] = useState("");
  const [orgLogoB64, setOrgLogoB64] = useState<string | null>(null);

  // Step 2 student — goals
  const [level, setLevel] = useState<Level>("B1");
  const [goals, setGoals] = useState<Goal[]>(["conversation"]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleGoal = (id: Goal) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  function handleLogoFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setOrgLogoB64(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const canNext0 = name.trim().length > 0 && email.includes("@") && password.length >= 8;
  const canNext1 = role !== null;
  const canSubmit = role === "teacher"
    ? canNext0 && canNext1 && orgName.trim().length > 0
    : canNext0 && canNext1 && goals.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name, email, password, role };

      if (role === "teacher") {
        body.organizationName = orgName.trim();
        if (orgLogoB64) body.logoBase64 = orgLogoB64;
      } else {
        body.teacherEmail = teacherEmail || undefined;
        body.level = level;
        body.goals = goals;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar conta."); setStep(0); return; }

      // Se professor mandou logo, envia via PATCH /api/organization
      if (role === "teacher" && orgLogoB64) {
        await fetch("/api/organization", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: orgName.trim(), logoBase64: orgLogoB64 }),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeUp">
        <Link href="/landing" className="inline-flex justify-center mb-8 w-full">
          <Logo size={30} />
        </Link>

        <StepIndicator labels={stepLabels(role)} step={step} />

        <div className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] p-8">
          {error && (
            <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 0 && (
            <CredentialsStep
              name={name} email={email} password={password}
              onName={setName} onEmail={setEmail} onPassword={setPassword}
              canNext={canNext0} onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <RoleStep
              role={role} onRole={setRole}
              teacherEmail={teacherEmail} onTeacherEmail={setTeacherEmail}
              canNext={canNext1} onBack={() => setStep(0)} onNext={() => setStep(2)}
            />
          )}

          {step === 2 && role === "teacher" && (
            <TeacherOrgStep
              accountName={name} orgName={orgName} onOrgName={setOrgName}
              logoPreview={orgLogoB64} onLogoFile={handleLogoFile}
              canSubmit={canSubmit} loading={loading}
              onBack={() => setStep(1)} onSubmit={handleSubmit}
            />
          )}

          {step === 2 && role !== "teacher" && (
            <StudentGoalsStep
              level={level} onLevel={setLevel}
              goals={goals} onToggleGoal={toggleGoal}
              canSubmit={canSubmit} loading={loading}
              onBack={() => setStep(1)} onSubmit={handleSubmit}
            />
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
