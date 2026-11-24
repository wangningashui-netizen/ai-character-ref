import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Masthead } from '@/components/layout/Masthead'
import { RecipeDock } from '@/components/layout/RecipeDock'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <TooltipProvider>
      <div className="flex min-h-svh flex-col bg-white text-foreground">
        <Masthead />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-8 pb-32 sm:px-6 sm:pt-10">
          <Outlet />
        </main>
        <RecipeDock />
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
