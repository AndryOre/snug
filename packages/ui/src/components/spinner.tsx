import { cn } from '@workspace/ui/lib/utils'
import { Loader2Icon } from 'lucide-react'

function Spinner({ className, ...properties }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...properties}
    />
  )
}

export { Spinner }
