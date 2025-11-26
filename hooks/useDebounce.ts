'use client';

import { useCallback, useRef } from "react";

/**
 * Creates a debounced function that delays invoking the provided callback until after the specified delay.
 *
 * @param callback - Function to invoke after the delay elapses.
 * @param delay - Delay in milliseconds to wait before calling `callback`.
 * @returns A function which, when called, cancels any pending invocation and schedules `callback` to run after `delay` milliseconds.
 */
export function useDebounce(callback: () => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(() => {
        if(timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(callback, delay);
    }, [callback, delay])
}