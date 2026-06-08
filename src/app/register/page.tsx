"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePdf, GraduationCap, BookOpen, ArrowRight } from "@phosphor-icons/react";

type Role = "teacher" | "student";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = role && name.trim() && email && password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, teacherEmail: teacherEmail || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-brand">
            <FilePdf size={20} weight="bold" color="white" />
          </div>
          <span className="font-extrabold text-[22px] text-slate-900 tracking-[-0.4px]">ActivePDF</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] p-8"
        >
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Criar conta</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Selecione seu perfil</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {(["teacher", "student"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={[
                  "flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-all duration-150 outline-none",
                  role === r
                    ? "border-brand bg-brand-light"
                    : "border-slate-200 bg-white hover:border-slate-300",
                ].join(" ")}
              >
                {r === "teacher"
                  ? <GraduationCap size={22} weight="bold" className={role === r ? "text-brand" : "text-slate-400"} />
                  : <BookOpen size={22} weight="bold" className={role === r ? "text-brand" : "text-slate-400"} />
                }
                <span className={`text-xs font-semibold ${role === r ? "text-brand" : "text-slate-600"}`}>
                  {r === "teacher" ? "Professor" : "Aluno"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3.5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nome completo</label>
              <input type="text" className="ui-input text-sm py-2.5" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" className="ui-input text-sm py-2.5" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Senha <span className="text-slate-400 font-normal">(mín. 6 caracteres)</span></label>
              <input type="password" className="ui-input text-sm py-2.5" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>

            {role === "student" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email do professor <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input type="email" className="ui-input text-sm py-2.5" placeholder="professor@email.com" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} autoComplete="off" />
                <p className="text-[11px] text-slate-400 mt-1">Informe para ser vinculado automaticamente ao seu professor.</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={!canSubmit || loading} className="ui-btn ui-btn-primary ui-btn-lg w-full">
            {loading ? <div className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : (
              <>Criar conta <ArrowRight size={16} weight="bold" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Já tem conta?{" "}
          <a href="/login" className="font-semibold text-brand hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
