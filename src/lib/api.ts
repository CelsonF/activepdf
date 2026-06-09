const API_URL = process.env.API_URL ?? "http://localhost:4000";

// Used in server components — reads the session cookie and forwards as Bearer token
export async function serverFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("activepdf_session")?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    // Disable Next.js fetch cache for dynamic data
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw err;
  }

  return res.json() as Promise<T>;
}
