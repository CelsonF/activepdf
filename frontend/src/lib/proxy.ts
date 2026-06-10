import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function proxyRequest(
  backendPath: string,
  req: Request,
  searchParams?: URLSearchParams
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("activepdf_session")?.value;

  const url = searchParams?.size
    ? `${API_URL}${backendPath}?${searchParams}`
    : `${API_URL}${backendPath}`;

  const isBodyMethod = ["POST", "PATCH", "PUT"].includes(req.method);

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(isBodyMethod ? { body: await req.text() } : {}),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
