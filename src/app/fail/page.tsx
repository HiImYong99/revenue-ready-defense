'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'The payment process was cancelled or failed.';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4 font-mono">
      <div className="bg-gray-900 border-4 border-red-600 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-500 mb-2">Payment Failed</h1>
        <p className="text-gray-400 mb-6">{message}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md transition-colors w-full"
        >
          Return to Game
        </button>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailContent />
    </Suspense>
  );
}
