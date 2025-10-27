import { getGuideByServiceId } from '@/lib/guides/guide-actions'
import { GuideDetailContent } from '@/components/guides/guide-detail-content'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { redirect } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const result = await getGuideByServiceId(serviceId)

  if (!result.success || !result.data) {
    return {
      title: 'Guide Not Found | SubSavvyAI',
    }
  }

  return {
    title: `Cancel ${result.data.service_name} | SubSavvyAI`,
    description: `Step-by-step guide to cancel your ${result.data.service_name} subscription`,
  }
}

export default async function GuideDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const result = await getGuideByServiceId(serviceId)

  if (!result.success || !result.data) {
    // Redirect to guides list if guide not found
    redirect('/dashboard/guides')
  }

  return (
    <DashboardLayout>
      <GuideDetailContent guide={result.data} />
    </DashboardLayout>
  )
}
