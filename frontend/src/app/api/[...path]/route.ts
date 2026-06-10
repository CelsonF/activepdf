import { proxyRequest } from "@/lib/proxy";

// Catch-all proxy: forwards any /api/* request not handled by a specific route file
// to the Hono backend. Next.js prioritizes specific routes (auth/*, exercises/*)
// over this catch-all, so there is no conflict.

type Ctx = { params: { path: string[] } };

export async function GET(req: Request, { params }: Ctx) {
  const { searchParams } = new URL(req.url);
  return proxyRequest(`/api/${params.path.join("/")}`, req, searchParams);
}

export async function POST(req: Request, { params }: Ctx) {
  return proxyRequest(`/api/${params.path.join("/")}`, req);
}

export async function PATCH(req: Request, { params }: Ctx) {
  return proxyRequest(`/api/${params.path.join("/")}`, req);
}

export async function DELETE(req: Request, { params }: Ctx) {
  return proxyRequest(`/api/${params.path.join("/")}`, req);
}

export async function PUT(req: Request, { params }: Ctx) {
  return proxyRequest(`/api/${params.path.join("/")}`, req);
}
