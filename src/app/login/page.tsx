"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePdf, EnvelopeSimple, LockSimple, ArrowRight } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        {/* Logo */}
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
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Entrar</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Acesse sua conta</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <EnvelopeSimple size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className="ui-input pl-8 text-sm py-2.5"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Senha</label>
              <div className="relative">
                <LockSimple size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  className="ui-input pl-8 text-sm py-2.5"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-lg w-full">
            {loading ? <div className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : (
              <>Entrar <ArrowRight size={16} weight="bold" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Não tem conta?{" "}
          <a href="/register" className="font-semibold text-brand hover:underline">
            Cadastre-se
          </a>
        </p>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 text-center">
          <strong>Demo:</strong> sarah@activepdf.app / teacher123<br />
          joao@activepdf.app / student123
        </div>
      </div>
    </div>
  );
}
