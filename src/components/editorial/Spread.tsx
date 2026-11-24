import type { ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ZoomViewport } from '@/components/common/ZoomViewport'

export function Spread({
  open,
  onOpenChange,
  imageUrl,
  alt,
  title,
  onPrev,
  onNext,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  alt: string
  title: string
  onPrev?: () => void
  onNext?: () => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[100dvh] w-[100vw] max-w-[100vw] gap-0 overflow-y-auto rounded-none border-0 bg-white p-0 shadow-none ring-0 sm:max-h-[92dvh] sm:w-[min(1120px,94vw)] sm:max-w-[min(1120px,94vw)] sm:border sm:border-rule"
      >
        <div className="grid min-h-[70dvh] md:grid-cols-[minmax(0,1.2fr)_minmax(280px,360px)]">
          <div className="relative flex min-h-[48dvh] items-center justify-center bg-paper p-4 md:min-h-[78dvh] md:p-8">
            <ZoomViewport imageUrl={imageUrl} alt={alt} className="h-[46dvh] min-h-0 md:h-[70dvh]" />
            {onPrev && (
              <button type="button" aria-label="上一张" onClick={onPrev} className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center border border-rule bg-white">
                <ChevronLeftIcon className="size-4" />
              </button>
            )}
            {onNext && (
              <button type="button" aria-label="下一张" onClick={onNext} className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center border border-rule bg-white">
                <ChevronRightIcon className="size-4" />
              </button>
            )}
          </div>
          <aside className="flex flex-col gap-5 border-t border-rule p-5 md:border-t-0 md:border-l">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="font-serif text-2xl leading-snug">{title}</DialogTitle>
              <DialogClose className="flex size-11 shrink-0 items-center justify-center border border-rule" aria-label="关闭">
                <XIcon className="size-4" />
              </DialogClose>
            </div>
            {children}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
