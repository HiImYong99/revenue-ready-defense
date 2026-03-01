'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { useGameStore } from '@/store/gameStore';

const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

export default function TossPaymentWidget() {
  const store = useGameStore();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<unknown>(null);
  const [price, setPrice] = useState(1000);

  useEffect(() => {
    (async () => {
      // Load payment widget
      const paymentWidget = await loadPaymentWidget(clientKey, "ANONYMOUS");

      // Render payment methods widget
      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
        "#payment-widget",
        { value: price },
        { variantKey: "DEFAULT" }
      );

      // Render agreement widget
      paymentWidget.renderAgreement(
        "#agreement",
        { variantKey: "AGREEMENT" }
      );

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentMethodsWidget = paymentMethodsWidgetRef.current as any;
    if (paymentMethodsWidget == null) return;
    // Update amount if price changes
    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  const requestPayment = async () => {
    const paymentWidget = paymentWidgetRef.current;
    if (!paymentWidget) return;

    try {
      const orderId = `ORD_USER_${Date.now()}`;

      await paymentWidget.requestPayment({
        orderId,
        orderName: `${price === 1000 ? '100' : price === 5000 ? '550' : '1200'} Diamonds`,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });

    } catch (error) {
      console.error(error);
      alert("Payment Error.");
    }
  };

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-xl flex flex-col items-center max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">Diamond Packs</h2>

      <div className="flex gap-2 mb-6">
         <button onClick={() => setPrice(1000)} className={`px-3 py-1 border rounded ${price === 1000 ? 'bg-blue-500 text-white' : ''}`}>100 💎 (₩1,000)</button>
         <button onClick={() => setPrice(5000)} className={`px-3 py-1 border rounded ${price === 5000 ? 'bg-blue-500 text-white' : ''}`}>550 💎 (₩5,000)</button>
         <button onClick={() => setPrice(10000)} className={`px-3 py-1 border rounded ${price === 10000 ? 'bg-blue-500 text-white' : ''}`}>1200 💎 (₩10,000)</button>
      </div>

      <div id="payment-widget" className="w-full" />
      <div id="agreement" className="w-full" />

      <button
        className="mt-4 px-6 py-3 w-full bg-[#3182f6] text-white font-bold rounded-md hover:bg-[#1b64da] transition-colors"
        onClick={requestPayment}
      >
        Pay ₩{price.toLocaleString()}
      </button>
    </div>
  );
}
