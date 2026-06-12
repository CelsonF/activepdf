import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { ContinueSection } from '@/components/dashboard/continue-section'
import { RecommendedSection } from '@/components/dashboard/recommended-section'
import { DetailsPanel } from '@/components/dashboard/details-panel'
import { listDocs } from '@/lib/tool-storage'

// Os dados vêm do localStorage do visitante — não há o que renderizar no servidor
export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: Dashboard,
})

function Dashboard() {
  const { data: docs, isPending } = useQuery({
    queryKey: ['tool-docs'],
    queryFn: () => Promise.resolve(listDocs()),
  })

  return (
    <div className="h-screen w-screen bg-highlight/40">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_340px]">
        <Sidebar />

        <div className="flex min-w-0 flex-col">
          <Topbar />
          <main className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
            <ContinueSection docs={docs} loading={isPending} />
            <RecommendedSection />
          </main>
        </div>

        <DetailsPanel docs={docs} loading={isPending} />
      </div>
    </div>
  )
}
