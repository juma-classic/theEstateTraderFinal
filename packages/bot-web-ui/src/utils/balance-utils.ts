import { shouldUseFakeRealMode } from '@deriv/shared';

/**
 * Gets the overridden balance for fake real mode
 * @param originalBalance The original balance from the client
 * @param loginId The current user's login ID
 * @param isVirtual Whether the account is virtual/demo
 * @returns The overridden balance if fake real mode is enabled, otherwise the original balance
 */
export const getOverriddenBalance = (originalBalance: string | number | undefined, loginId: string | null, isVirtual: boolean): string => {
    if (!shouldUseFakeRealMode(loginId, isVirtual)) return originalBalance?.toString() || '0.00';
    
    try {
        const offset = parseFloat(localStorage.getItem('demo_balance_offset') || '0');
        const baseBalance = parseFloat(originalBalance?.toString() || '0');
        return (baseBalance + offset).toFixed(2);
    } catch (e) {
        console.warn('Error calculating overridden balance:', e);
        return originalBalance?.toString() || '0.00';
    }
};

/**
 * Listens for balance offset changes and invokes the callback when they occur
 * @param callback Function to call when the balance offset changes
 * @returns A cleanup function to remove the event listener
 */
export const onBalanceOffsetChange = (callback: () => void): (() => void) => {
    window.addEventListener('demo_balance_offset_changed', callback);
    return () => window.removeEventListener('demo_balance_offset_changed', callback);
};
