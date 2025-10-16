"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChecklistTask {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
}

interface OnboardingChecklistCardProps {
  tasks: ChecklistTask[]
  onDismiss?: () => void
}

export function OnboardingChecklistCard({ tasks, onDismiss }: OnboardingChecklistCardProps) {
  const completedCount = tasks.filter(t => t.completed).length
  const progress = (completedCount / tasks.length) * 100

  // Don't show if all tasks completed
  if (completedCount === tasks.length) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Get Started</h2>
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} of {tasks.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              {!task.completed && task.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={task.action}
                  className="mt-2 h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                >
                  Start →
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
