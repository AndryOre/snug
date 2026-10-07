import { i18n } from '#i18n'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { ReactNode } from 'react'

interface SkeletonRowProperties {
  indentClassName: string
  children: ReactNode
}

function SkeletonRow({ indentClassName, children }: SkeletonRowProperties) {
  return (
    <div className={`flex h-7.5 items-center gap-1.5 px-1 ${indentClassName}`}>
      <Skeleton className="size-4" />
      {children}
    </div>
  )
}

/**
 * Placeholder of the Import preview while the file is being read: a summary
 * row and a few tree rows as skeletons.
 * @returns The skeleton, announced as a status.
 */
export function ImportPreviewSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-label={i18n.t('import_reading')}
    >
      <div className="flex flex-col gap-1.5 rounded-lg bg-muted p-3">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="flex flex-col rounded-lg border bg-card p-2">
        <SkeletonRow indentClassName="ml-0">
          <Skeleton className="h-3 w-40" />
        </SkeletonRow>
        <SkeletonRow indentClassName="ml-4">
          <Skeleton className="h-3 w-56" />
        </SkeletonRow>
        <SkeletonRow indentClassName="ml-8">
          <Skeleton className="h-3 w-48" />
        </SkeletonRow>
        <SkeletonRow indentClassName="ml-8">
          <Skeleton className="h-3 w-64" />
        </SkeletonRow>
        <SkeletonRow indentClassName="ml-4">
          <Skeleton className="h-3 w-44" />
        </SkeletonRow>
        <SkeletonRow indentClassName="ml-0">
          <Skeleton className="h-3 w-36" />
        </SkeletonRow>
      </div>
    </div>
  )
}
