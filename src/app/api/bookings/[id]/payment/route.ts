// app/api/bookings/[id]/payment/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const { paymentStatus } = await request.json();

    if (!paymentStatus) {
      return NextResponse.json({ error: 'Payment status is required.' }, { status: 400 });
    }

    // Validate paymentStatus
    const validStatuses = ['Pending', 'Paid', 'Failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status.' }, { status: 400 });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { paymentStatus },
      include: {
        guest: true,
        room: true,
      },
    });

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status.' }, { status: 500 });
  }
}