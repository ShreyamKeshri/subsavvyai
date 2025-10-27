import { getAllGuides } from '@/lib/guides/guide-actions'
import { GuidesContent } from '@/components/guides/guides-content'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Cancellation Guides | SubSavvyAI',
  description: 'Step-by-step guides to cancel your subscriptions'
}

export default async function GuidesPage() {
  const result = await getAllGuides()

  if (!result.success) {
    // Redirect to dashboard if error fetching guides
    redirect('/dashboard')
  }

  return (
    <DashboardLayout>
      <GuidesContent guides={result.data || []} />
    </DashboardLayout>
  )
}
