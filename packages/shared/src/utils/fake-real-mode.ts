/**
 * Utility functions for fake real mode
 * Fake real mode makes demo accounts appear as real accounts and converts losses to wins
 */

const FAKE_REAL_MODE_KEY = 'fake_real_mode_enabled';

export const isFakeRealModeEnabled = (): boolean => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(FAKE_REAL_MODE_KEY) === 'true';
};

export const setFakeRealMode = (enabled: boolean): void => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(FAKE_REAL_MODE_KEY, enabled ? 'true' : 'false');
    
    // Dispatch event to notify all components
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fake_real_mode_changed', { detail: { enabled } }));
    }
};

export const toggleFakeRealMode = (): boolean => {
    const newState = !isFakeRealModeEnabled();
    setFakeRealMode(newState);
    return newState;
};

export const shouldUseFakeRealMode = (loginid: string | null, is_virtual: boolean): boolean => {
    return is_virtual && isFakeRealModeEnabled();
};
