'use client'

import { NAV_ITEMS } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchCommand } from './SearchCommand'
import React from 'react'

const NavItems = () => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path == '/') return pathname == '/';
        return pathname.startsWith(path);
    }

    return (
        <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium'>
            {NAV_ITEMS.map(({ href, label }) => {
                // 1. Check if this is the Search item
                if (label === "Search") {
                    return (
                        <li key="search-trigger">
                            <SearchCommand 
                                renderAs="text"
                                label="Search"
                                initialStocks={[{symbol: 'TICKER', name: 'TESTING STOCK', exchange: 'NASDAQ', type: 'STOCKTYPE'}]}
                            />
                        </li>
                    )
                }

                // 2. Otherwise, render a standard Link
                return (
                    <li key={href}>
                        <Link 
                            href={href} 
                            className={`hover:text-yellow-500 transition-colors ${
                                isActive(href) ? 'text-gray-100' : ''
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
