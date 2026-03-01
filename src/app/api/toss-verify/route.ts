import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId, amount, paymentKey } = await request.json();

    if (!orderId || !amount || !paymentKey) {
      return NextResponse.json({ success: false, message: 'Missing payment details' }, { status: 400 });
    }

    // In a real application, you would verify the amount with the product price in the database
    // and verify the payment with Toss Payments API using the secret key
    // For this benchmark, we'll simulate a successful verification if amount matches our packs

    const validPrices = [1000, 5000, 10000];

    if (validPrices.includes(amount)) {
       // Simulate success
       return NextResponse.json({ success: true, orderId, amount, paymentKey }, { status: 200 });
    } else {
       return NextResponse.json({ success: false, message: 'Invalid Amount' }, { status: 400 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
  }
}
