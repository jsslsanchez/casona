// /src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail'; // Import sendEmail

// GET /api/bookings - Retrieve all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
      },
    });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings.' }, { status: 500 });
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      checkIn,
      checkOut,
      numGuests,
      roomNumber,
      guest: {
        identification,
        documentType,
        firstName,
        lastName,
        email,
        phone,
        country,
      },
    } = data;

    // Validate required fields
    if (
      !checkIn ||
      !checkOut ||
      !numGuests ||
      !roomNumber ||
      !identification ||
      !documentType ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !country
    ) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { roomNumber },
    });

    if (!room) {
      return NextResponse.json({ error: 'Selected room does not exist.' }, { status: 404 });
    }

    // Create or connect guest
    const guest = await prisma.guest.upsert({
      where: { identification_documentType: { identification, documentType } },
      update: {
        firstName,
        lastName,
        email,
        phone,
        country,
      },
      create: {
        identification,
        documentType,
        firstName,
        lastName,
        email,
        phone,
        country,
      },
    });

    // Calculate totalAmount based on room price and duration
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const nights = Math.max(Math.floor(diffDays), 1); // Ensure at least 1 night
    const totalAmount = nights * room.pricePerNight;

    // Log for debugging
    console.log(`Booking Details: Check-In: ${checkInDate}, Check-Out: ${checkOutDate}, Nights: ${nights}, Price/Night: ${room.pricePerNight}, Total Amount: ${totalAmount}`);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'Confirmed', // Default status
        numGuests,
        totalAmount,
        paymentStatus: 'Pending', // Initial payment status
        guestId: guest.identification,
        roomNumber,
      },
      include: {
        guest: true,
        room: true,
      },
    });

    // Send confirmation email to guest
    try {
      await sendEmail({
        to: guest.email,
        subject: 'Your Reservation Confirmation',
        text: `Hello ${guest.firstName},\n\nThank you for your reservation at our hotel. Here are your booking details:\n\nRoom Number: ${room.roomNumber}\nCheck-In: ${checkInDate.toLocaleDateString()}\nCheck-Out: ${checkOutDate.toLocaleDateString()}\nNumber of Guests: ${numGuests}\nTotal Amount: $${totalAmount}\n\nWe look forward to hosting you!\n\nBest Regards,\nHotel Team`,
        html: `<p>Hello <strong>${guest.firstName}</strong>,</p>
               <p>Thank you for your reservation at our hotel. Here are your booking details:</p>
               <ul>
                 <li><strong>Room Number:</strong> ${room.roomNumber}</li>
                 <li><strong>Check-In:</strong> ${checkInDate.toLocaleDateString()}</li>
                 <li><strong>Check-Out:</strong> ${checkOutDate.toLocaleDateString()}</li>
                 <li><strong>Number of Guests:</strong> ${numGuests}</li>
                 <li><strong>Total Amount:</strong> $${totalAmount}</li>
               </ul>
               <p>We look forward to hosting you!</p>
               <p><strong>Best Regards,</strong><br/>Hotel Team</p>`,
      });
      console.log(`Confirmation email sent to ${guest.email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Optionally, you can decide to continue or rollback the booking creation
      // For now, we'll continue and inform the client
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking.' }, { status: 500 });
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
      include: {
        guest: true,
        room: true,
      },
    });

    return NextResponse.json(updatedBooking, { status: 200 });
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

    // Optionally, fetch booking details before deletion to send cancellation email
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    // Send cancellation email to guest
    try {
      await sendEmail({
        to: booking.guest.email,
        subject: 'Your Reservation Cancellation',
        text: `Hello ${booking.guest.firstName},\n\nYour reservation for Room ${booking.room.roomNumber} from ${booking.checkIn.toLocaleDateString()} to ${booking.checkOut.toLocaleDateString()} has been cancelled.\n\nIf this was a mistake or you have any questions, please contact us.\n\nBest Regards,\nHotel Team`,
        html: `<p>Hello <strong>${booking.guest.firstName}</strong>,</p>
               <p>Your reservation for <strong>Room ${booking.room.roomNumber}</strong> from <strong>${booking.checkIn.toLocaleDateString()}</strong> to <strong>${booking.checkOut.toLocaleDateString()}</strong> has been cancelled.</p>
               <p>If this was a mistake or you have any questions, please contact us.</p>
               <p><strong>Best Regards,</strong><br/>Hotel Team</p>`,
      });
      console.log(`Cancellation email sent to ${booking.guest.email}`);
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Optionally, handle email sending failure
    }

    return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
