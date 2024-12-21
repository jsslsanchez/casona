// src/app/api/guests/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all guests
export async function GET(request: NextRequest) {
  try {
    const guests = await prisma.guest.findMany({
      select: {
        identification: true,
        documentType: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });
    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}