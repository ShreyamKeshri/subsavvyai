'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose prose-gray dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8 first:prose-h1:mt-0',
        'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-800',
        'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-6',
        'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4',
        'prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium',
        'prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2',
        'prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold',
        'prose-em:text-gray-600 dark:prose-em:text-gray-400 prose-em:italic',
        'prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
        'prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
