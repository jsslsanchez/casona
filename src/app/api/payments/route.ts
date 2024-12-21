// /src/app/api/payments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail'; // Import sendEmail

export async function POST(request: NextRequest) {
  try {
    const { reservationId, amount, cardNumber, expiryDate, cvc } = await request.json();

    // Validate required fields
    if (!reservationId || !amount || !cardNumber || !expiryDate || !cvc) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    // Fetch the booking to ensure it exists
    const booking = await prisma.booking.findUnique({
      where: { id: Number(reservationId) },
      include: {
        guest: true,
        room: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Prepare payment details
    const paymentDetails = {
      reservationId: booking.id,
      amount: booking.totalAmount,
      cardNumber,
      expiryDate,
      cvc,
    };

    // Send payment details to Mockoon Payment Gateway
    const response = await fetch('http://localhost:3002/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      // Update booking payment status to 'Paid'
      await prisma.booking.update({
        where: { id: Number(reservationId) },
        data: { paymentStatus: 'Paid', paymentIntentId: data.transactionId },
      });

      // Send payment receipt email to guest
      try {
        await sendEmail({
          to: booking.guest.email,
          subject: 'Payment Receipt for Your Reservation',
          text: `Hello ${booking.guest.firstName},\n\nYour payment of $${amount} for your reservation (Booking ID: ${booking.id}) has been successfully processed.\n\nPayment Details:\nTransaction ID: ${data.transactionId}\nAmount: $${amount}\n\nThank you for choosing our hotel!\n\nBest Regards,\nHotel Team`,
          html: `<p>Hello <strong>${booking.guest.firstName}</strong>,</p>
                 <p>Your payment of <strong>$${amount}</strong> for your reservation (<strong>Booking ID: ${booking.id}</strong>) has been successfully processed.</p>
                 <h3>Payment Details:</h3>
                 <ul>
                   <li><strong>Transaction ID:</strong> ${data.transactionId}</li>
                   <li><strong>Amount:</strong> $${amount}</li>
                 </ul>
                 <p>Thank you for choosing our hotel!</p>
                 <p><strong>Best Regards,</strong><br/>Hotel Team</p>`,
        });
        console.log(`Payment receipt email sent to ${booking.guest.email}`);
      } catch (emailError) {
        console.error('Error sending payment receipt email:', emailError);
        // Optionally, handle email sending failure
      }

      return NextResponse.json({ message: 'Payment successful.', transactionId: data.transactionId }, { status: 200 });
    } else {
      // Update booking payment status to 'Failed'
      await prisma.booking.update({
        where: { id: Number(reservationId) },
        data: { paymentStatus: 'Failed' },
      });

      return NextResponse.json({ error: data.error || 'Payment failed.' }, { status: 402 });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'An error occurred during payment processing.' }, { status: 500 });
  }
}