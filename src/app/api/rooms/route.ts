import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Path to your default images (update paths based on your actual structure)
const DEFAULT_IMAGES: Record<string, string> = {
  Single: "/images/single-room.jpg",
  Double: "/images/double-room.jpg",
  Suite: "/images/suite-room.jpg",
  Family: "/images/family-room.jpg",
  default: "/images/default-room.jpg", // General fallback image
};

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }, // Ensures images are ordered correctly
        },
      },
    });
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      roomNumber,
      roomType,
      pricePerNight,
      capacity,
      size,
      features,
      description,
      images,
    } = await request.json();

    // Validate required fields
    if (
      !roomNumber ||
      !roomType ||
      pricePerNight == null ||
      capacity == null ||
      size == null ||
      !features
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if room already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber },
    });

    if (existingRoom) {
      return NextResponse.json({ error: 'Room number already exists' }, { status: 409 });
    }

    // Use provided images or set a default based on the room type
    const defaultImage =
      roomType in DEFAULT_IMAGES ? DEFAULT_IMAGES[roomType] : DEFAULT_IMAGES.default;

    const imagesData =
      images && images.length > 0
        ? {
            create: images.map((image: { url: string; displayOrder: number }) => ({
              url: image.url,
              displayOrder: image.displayOrder,
            })),
          }
        : {
            create: [
              {
                url: defaultImage,
                displayOrder: 1,
              },
            ],
          };

    // Create the room
    const newRoom = await prisma.room.create({
      data: {
        roomNumber,
        roomType,
        pricePerNight,
        capacity,
        size,
        features,
        description: description || '',
        images: imagesData,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}