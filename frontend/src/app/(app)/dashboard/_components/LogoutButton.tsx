"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button onClick={handleLogout} className="ui-btn ui-btn-ghost ui-btn-xs text-slate-500">
      Sair
    </button>
  );
}
