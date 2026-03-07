import { createRootRouteWithContext } from '@tanstack/react-router'
import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import type { QueryClient } from '@tanstack/react-query'
import { Agentation } from 'agentation'
import { ApiKeyProvider } from '../components/auth/ApiKeyProvider'
import { SecureStorageGate } from '../components/auth/SecureStorageGate'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <TanStackQueryProvider>
      <ApiKeyProvider>
        <SecureStorageGate>
          <Outlet />
          {import.meta.env.DEV && <Agentation />}
        </SecureStorageGate>
      </ApiKeyProvider>
    </TanStackQueryProvider>
  )
}

import { Outlet } from '@tanstack/react-router'
