import React, { useEffect, useRef, useState } from 'react';
import { toggleFakeRealMode, isFakeRealModeEnabled } from '@deriv/shared';

/**
 * GestureDetector component
 * Detects swipe right 4 times followed by swipe left 2 times to toggle fake real mode
 */
const GestureDetector: React.FC = () => {
    const [gesture, setGesture] = useState<string[]>([]);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const lastGestureTime = useRef<number>(Date.now());

    const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
    const GESTURE_TIMEOUT = 3000; // Reset gesture sequence after 3 seconds
    const TARGET_SEQUENCE = ['right', 'right', 'right', 'right', 'left', 'left'];

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndX.current = e.changedTouches[0].clientX;
            handleSwipe();
        };

        const handleSwipe = () => {
            const now = Date.now();
            
            // Reset gesture if too much time has passed
            if (now - lastGestureTime.current > GESTURE_TIMEOUT) {
                setGesture([]);
            }
            
            lastGestureTime.current = now;

            const diff = touchEndX.current - touchStartX.current;
            
            if (Math.abs(diff) < SWIPE_THRESHOLD) return;

            const direction = diff > 0 ? 'right' : 'left';
            
            setGesture(prev => {
                const newGesture = [...prev, direction];
                
                // Check if we've completed the sequence
                if (newGesture.length === TARGET_SEQUENCE.length) {
                    const matches = newGesture.every((dir, idx) => dir === TARGET_SEQUENCE[idx]);
                    
                    if (matches) {
                        const newState = toggleFakeRealMode();
                        
                        // Show notification
                        if (typeof window !== 'undefined') {
                            const message = newState 
                                ? '🎭 Fake Real Mode: ON - All losses will become wins!' 
                                : '✅ Fake Real Mode: OFF - Normal trading mode';
                            
                            // Create a toast notification
                            const toast = document.createElement('div');
                            toast.textContent = message;
                            toast.style.cssText = `
                                position: fixed;
                                top: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: ${newState ? '#4CAF50' : '#2196F3'};
                                color: white;
                                padding: 16px 24px;
                                border-radius: 8px;
                                font-size: 16px;
                                font-weight: bold;
                                z-index: 999999;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                animation: slideDown 0.3s ease-out;
                            `;
                            
                            document.body.appendChild(toast);
                            
                            setTimeout(() => {
                                toast.style.animation = 'slideUp 0.3s ease-out';
                                setTimeout(() => toast.remove(), 300);
                            }, 3000);
                        }
                        
                        return [];
                    }
                    
                    // If sequence doesn't match, keep only the last few gestures
                    return newGesture.slice(-5);
                }
                
                return newGesture;
            });
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
            style.remove();
        };
    }, []);

    // Show debug indicator in development (optional)
    if (process.env.NODE_ENV === 'development' && gesture.length > 0) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 999999,
            }}>
                Gesture: {gesture.join(' → ')} ({gesture.length}/{TARGET_SEQUENCE.length})
            </div>
        );
    }

    return null;
};

export default GestureDetector;
