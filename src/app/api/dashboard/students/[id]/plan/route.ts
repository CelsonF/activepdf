import { proxyRequest } from "@/lib/proxy";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return proxyRequest(`/api/students/${params.id}/plan`, req);
}
