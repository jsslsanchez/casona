import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/bookings/[id] - Retrieve a booking by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = parseInt(params.id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true, // Include guest details
        room: true,  // Include room details
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/bookings/[id] - Update a booking by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = parseInt(params.id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await req.json();

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
        checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
        status: body.status,
        numGuests: body.numGuests,
        totalAmount: body.totalAmount,
        paymentStatus: body.paymentStatus,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] - Delete a booking by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = parseInt(params.id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}