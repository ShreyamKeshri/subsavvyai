/**
 * Confidence Badge Component
 * Displays confidence level for Gmail-detected subscriptions
 */

import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBadge({
  confidence,
  showLabel = true,
  size = 'md'
}: ConfidenceBadgeProps) {
  const config = {
    high: {
      icon: CheckCircle2,
      label: 'High',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-700 dark:text-green-400',
      iconClass: 'text-green-600 dark:text-green-400',
    },
    medium: {
      icon: AlertTriangle,
      label: 'Medium',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-700 dark:text-yellow-400',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
    },
    low: {
      icon: AlertTriangle,
      label: 'Low',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      textClass: 'text-orange-700 dark:text-orange-400',
      iconClass: 'text-orange-600 dark:text-orange-400',
    },
  };

  /* eslint-disable security/detect-object-injection */
  // Safe: confidence is constrained to 'high' | 'medium' | 'low'
  const { icon: Icon, label, bgClass, textClass, iconClass } = config[confidence];
  /* eslint-enable security/detect-object-injection */

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    /* eslint-disable security/detect-object-injection */
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${bgClass} ${textClass} ${sizeClasses[size]}`}
    >
      <Icon className={`${iconClass} ${iconSizes[size]}`} />
      {showLabel && <span>{label}</span>}
    </span>
    /* eslint-enable security/detect-object-injection */
  );
}

/**
 * Confidence Level Explanation Tooltip
 */
export function ConfidenceExplanation() {
  return (
    <div className="text-xs text-muted-foreground space-y-2">
      <p className="font-medium">Confidence Levels:</p>
      <ul className="space-y-1">
        <li className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400">●</span>
          <span><strong>High:</strong> Verified sender, subject, and amount matched</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-yellow-600 dark:text-yellow-400">●</span>
          <span><strong>Medium:</strong> Two signals matched (sender + subject)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-orange-600 dark:text-orange-400">●</span>
          <span><strong>Low:</strong> One signal matched - please verify</span>
        </li>
      </ul>
    </div>
  );
}
