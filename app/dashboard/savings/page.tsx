import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getSavingsData } from '@/lib/savings/savings-actions'
import { SavingsContent } from '@/components/savings/savings-content'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export const metadata = {
  title: 'Savings Tracker - SubSavvyAI',
  description: 'Track how much you\'ve saved by optimizing your subscriptions',
}

async function SavingsDataFetcher() {
  const result = await getSavingsData()

  if (!result.success || !result.data) {
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-8 text-center border border-red-200 dark:border-red-800">
        <p className="text-red-800 dark:text-red-200">
          Failed to load savings data. Please try again.
        </p>
      </div>
    )
  }

  return <SavingsContent savingsData={result.data} />
}

function SavingsLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading your savings data...
        </p>
      </div>
    </div>
  )
}

export default function SavingsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<SavingsLoadingSkeleton />}>
        <SavingsDataFetcher />
      </Suspense>
    </DashboardLayout>
  )
}
