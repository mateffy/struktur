import { hydrateRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

const router = getRouter()

hydrateRoot(document.getElementById('app')!, <RouterProvider router={router} />)
