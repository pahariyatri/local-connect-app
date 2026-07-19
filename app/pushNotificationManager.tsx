'use client';

import { useEffect, useState } from 'react';

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            navigator.serviceWorker.register('/sw.js').catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        }
    }, []);

    async function subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            });
            setSubscription(subscription);

        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }

    async function unsubscribeFromPush() {
        if (subscription) {
            try {
                await subscription.unsubscribe();
                setSubscription(null);

            } catch (error) {
                console.error('Error unsubscribing:', error);
            }
        }
    }

    return (
        <div>
            <h3>Push Notifications</h3>
            {isSupported ? (
                subscription ? (
                    <>
                        <p>You are subscribed to push notifications.</p>
                        <button onClick={unsubscribeFromPush}>Unsubscribe</button>
                    </>
                ) : (
                    <button onClick={subscribeToPush}>Subscribe</button>
                )
            ) : (
                <p>Push notifications are not supported on this browser.</p>
            )}
        </div>
    );
}
