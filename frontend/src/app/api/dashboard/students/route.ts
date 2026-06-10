import { proxyRequest } from "@/lib/proxy";

export async function GET(req: Request) {
  return proxyRequest("/api/students", req);
}

export async function POST(req: Request) {
  return proxyRequest("/api/students", req);
}
