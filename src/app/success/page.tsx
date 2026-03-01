'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

import { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useGameStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('Missing payment information.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/toss-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, amount: Number(amount), paymentKey }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Add diamonds
          const price = Number(amount);
          const diamondsToAdd = price === 1000 ? 100 : price === 5000 ? 550 : price === 10000 ? 1200 : 0;

          if (diamondsToAdd > 0) {
              store.addDiamonds(diamondsToAdd);
              setStatus('success');
          } else {
             setStatus('error');
             setErrorMessage('Invalid amount.');
          }
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Server error during verification.');
      }
    };

    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4 font-mono">
      <div className="bg-gray-900 border-4 border-amber-600 rounded-xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
             <div className="animate-spin text-4xl mb-4">⏳</div>
             <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
             <p className="text-gray-400">Please do not close this window.</p>
          </>
        )}

        {status === 'success' && (
          <>
             <div className="text-4xl mb-4">🎉</div>
             <h1 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h1>
             <p className="text-gray-400 mb-6">Diamonds have been added to your account.</p>
             <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-md transition-colors w-full"
             >
                Return to Game
             </button>
          </>
        )}

        {status === 'error' && (
          <>
             <div className="text-4xl mb-4">❌</div>
             <h1 className="text-2xl font-bold text-red-500 mb-2">Payment Failed</h1>
             <p className="text-gray-400 mb-6">{errorMessage}</p>
             <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md transition-colors w-full"
             >
                Return to Game
             </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
