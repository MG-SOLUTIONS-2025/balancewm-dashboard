'use client'

import { NAV_ITEMS } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchCommand } from './SearchCommand'
import React from 'react'

// Assuming types are global or imported
// import { StockWithWatchlistStatus } from '@/types' 

const NavItems = ({ initialStocks }: { initialStocks: StockWithWatchlistStatus[] }) => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    }

    return (
        <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium'>
            {NAV_ITEMS.map(({ href, label }) => {
                const active = isActive(href);

                // 1. Special case for Search (Modal Trigger)
                if (href === '/search') {
                    return (
                        <li key="search-trigger">
                            <SearchCommand 
                                renderAs="text"
                                label={label}
                                initialStocks={initialStocks}
                                className={`hover:text-yellow-500 transition-colors text-left ${
                                    active ? 'text-gray-100' : 'text-gray-400' 
                                }`}
                            />
                        </li>
                    )
                }

                // 2. Standard Link
                return (
                    <li key={href}>
                        <Link 
                            href={href} 
                            className={`hover:text-yellow-500 transition-colors ${
                                active ? 'text-gray-100' : ''
                            }`}
                        >
                            {label}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

export default NavItems
