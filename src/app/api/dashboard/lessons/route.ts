import { proxyRequest } from "@/lib/proxy";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return proxyRequest("/api/lessons", req, searchParams);
}

export async function POST(req: Request) {
  return proxyRequest("/api/lessons", req);
}
