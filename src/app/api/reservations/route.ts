// /app/api/reservations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(request: NextRequest) {
  const newReservation = await request.json();

  try {
    // Check if email already exists
    const existingGuest = await prisma.guest.findUnique({
      where: { email: newReservation.email },
    });

    if (existingGuest) {
      // Send email via SendGrid
      const msg = {
        to: newReservation.email,
        from: 'your_verified_email@example.com', // Replace with your verified sender
        subject: 'Duplicate Reservation Attempt',
        text: 'You have attempted to make a reservation with an email that already exists.',
        html: '<strong>You have attempted to make a reservation with an email that already exists.</strong>',
      };

      await sendgrid.send(msg);

      return NextResponse.json(
        { error: 'Email already exists. An email has been sent to the guest.' },
        { status: 400 }
      );
    }

    // Proceed to create guest and reservation
    // If the guest doesn't exist, create a new guest
    const guest = await prisma.guest.upsert({
      where: { email: newReservation.email },
      update: {},
      create: {
        identification: newReservation.identification,
        documentType: newReservation.documentType,
        firstName: newReservation.firstName,
        lastName: newReservation.lastName,
        email: newReservation.email,
        phone: newReservation.phone,
        country: newReservation.country,
      },
    });

    // Calculate total amount
    const checkInDate = new Date(newReservation.checkIn);
    const checkOutDate = new Date(newReservation.checkOut);
    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);
    const room = await prisma.room.findUnique({
      where: { roomNumber: newReservation.roomNumber },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    const totalAmount = nights * room.pricePerNight;

    // Create reservation
    const reservation = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'Confirmed',
        numGuests: newReservation.numGuests,
        totalAmount: totalAmount,
        paymentStatus: 'Pending',
        guestId: guest.identification,
        roomNumber: room.roomNumber,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the reservation.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const reservations = await prisma.booking.findMany({
      include: {
        guest: true,
        room: true,
      },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching reservations.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const updatedData = await request.json();

  try {
    // Update reservation
    const reservation = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        checkIn: new Date(updatedData.checkIn),
        checkOut: new Date(updatedData.checkOut),
        numGuests: updatedData.numGuests,
        roomNumber: updatedData.roomNumber,
        status: updatedData.status,
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the reservation.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Delete reservation
    await prisma.booking.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Reservation cancelled successfully.' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the reservation.' },
      { status: 500 }
    );
  }
}