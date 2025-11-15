'use client'

import { NAV_ITEMS } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const NavItems = () => {
    // Get the current URL pathname from Next.js navigation
    const pathname = usePathname()

    // Helper function to determine if a given path matches the current route
    const isActive = (path: string) => {
        // Special case: Check for exact match on home route
        // This prevents '/' from matching all routes that start with '/'
        if (path == '/') return pathname == '/'; 

        // For all other paths, check if current pathname starts with the given path
        // This allows parent routes to remain active when viewing child routes
        // Example: '/dashboard' stays active on '/dashboard/settings'
        return pathname.startsWith(path);
    }

  return (
    <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium'>
         {NAV_ITEMS.map(({href, label}) => (
            <li key={href}>
                <Link href={href} className={`hover:text-yellow-500 transition-colors ${
                    isActive(href) ? 'text-gray-100' : ''
                }`}>
                    {label}
                </Link>
            </li>
         ))}
    </ul>
  )
}

export default NavItems