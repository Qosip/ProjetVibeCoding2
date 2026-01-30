'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the review content with no SSR
const ReviewContent = dynamic(() => import('./ReviewContent'), {
    ssr: false,
    loading: () => (
        <main className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">Chargement...</p>
            </div>
        </main>
    ),
});

export default function ReviewPage() {
    return <ReviewContent />;
}
