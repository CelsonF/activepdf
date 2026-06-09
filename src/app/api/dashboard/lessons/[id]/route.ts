import { proxyRequest } from "@/lib/proxy";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return proxyRequest(`/api/lessons/${params.id}`, req);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return proxyRequest(`/api/lessons/${params.id}`, req);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return proxyRequest(`/api/lessons/${params.id}`, req);
}
