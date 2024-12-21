// /src/app/api/rooms/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch a specific room by roomNumber
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: roomNumber } = params;

  try {
    const room = await prisma.room.findUnique({
      where: { roomNumber },
      include: {
        images: true, // Include the images relation
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

// PUT: Update a specific room by roomNumber
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: roomNumber } = params;
  const { roomType, pricePerNight, capacity, size, features, description } = await request.json();

  // Basic validation
  if (!roomType || pricePerNight == null || capacity == null || size == null || !features) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const updatedRoom = await prisma.room.update({
      where: { roomNumber },
      data: {
        roomType,
        pricePerNight: parseFloat(pricePerNight),
        capacity: parseInt(capacity, 10),
        size: parseInt(size, 10),
        features,
        description: description || '',
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE: Delete a specific room by roomNumber
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: roomNumber } = params;

  try {
    // Delete related RoomImages first
    await prisma.roomImage.deleteMany({
      where: { roomNumber },
    });

    // Delete related Bookings first
    await prisma.booking.deleteMany({
      where: { roomNumber },
    });

    // Now delete the room
    await prisma.room.delete({
      where: { roomNumber },
    });

    return NextResponse.json({ message: 'Room deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting room:', error);
    if (error.code === 'P2003') {
      // Foreign key constraint failed
      return NextResponse.json({ error: 'Cannot delete room because it is referenced by other records.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}