import { renderToString } from 'react-dom/server'
import { RouterProvider, createMemoryHistory, createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { getContext } from './integrations/tanstack-query/root-provider'
import './styles.css'

export async function render(url: string) {
  console.log('Rendering URL:', url)
  
  const router = createTanStackRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [url],
    }),
    context: getContext(),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  console.log('Router state before load:', router.state)
  await router.load()
  console.log('Router state after load:', router.state)

  const html = renderToString(<RouterProvider router={router} />)

  const head = ''

  return { html, head }
}
