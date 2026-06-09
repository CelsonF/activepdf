import { proxyRequest } from "@/lib/proxy";

export async function GET(req: Request) {
  return proxyRequest("/api/subjects", req);
}

export async function POST(req: Request) {
  return proxyRequest("/api/subjects", req);
}
