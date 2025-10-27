'use client'

/**
 * Cancellation Guides Content Component
 * Main UI for browsing cancellation guides - based on Vercel V0 design
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CancellationGuide, DifficultyLevel } from '@/lib/guides/guide-actions'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface GuidesContentProps {
  guides: CancellationGuide[]
}

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

// Icon mapping for services (emojis)
const SERVICE_ICONS: Record<string, string> = {
  streaming: '🎬',
  music: '🎵',
  shopping: '📦',
  food: '🍔',
  fitness: '💪',
  education: '📚',
  productivity: '💼',
  other: '📱',
}

export function GuidesContent({ guides }: GuidesContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | DifficultyLevel>('All')
  const prefersReducedMotion = useReducedMotion()

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesSearch = guide.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = selectedDifficulty === 'All' || guide.difficulty_level === selectedDifficulty
      return matchesSearch && matchesDifficulty
    })
  }, [searchQuery, selectedDifficulty, guides])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cancellation Guides</h1>
        <p className="text-muted-foreground mt-2">Step-by-step guides to cancel your subscriptions</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for a service…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'easy', 'medium', 'hard'] as const).map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty === 'All' ? 'All' : difficulty)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDifficulty === difficulty
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-border'
            }`}
          >
            {difficulty === 'All' ? 'All' : DIFFICULTY_LABELS[difficulty as DifficultyLevel]}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuides.map((guide, index) => {
          const icon = SERVICE_ICONS[guide.service_category] || SERVICE_ICONS.other

          return (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{icon}</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      DIFFICULTY_COLORS[guide.difficulty_level]
                    }`}
                  >
                    {DIFFICULTY_LABELS[guide.difficulty_level]}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{guide.service_name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Cancel your {guide.service_name} subscription
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{guide.estimated_time_minutes} mins</span>
                </div>

                <Link href={`/dashboard/guides/${guide.service_id}`}>
                  <Button className="w-full">View Guide</Button>
                </Link>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No guides found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
