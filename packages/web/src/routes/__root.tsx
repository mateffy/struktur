import { createRootRouteWithContext } from '@tanstack/react-router'
import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import type { QueryClient } from '@tanstack/react-query'
import { Agentation } from 'agentation'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <TanStackQueryProvider>
      <Outlet />
      {import.meta.env.DEV && <Agentation />}
    </TanStackQueryProvider>
  )
}

import { Outlet } from '@tanstack/react-router'
