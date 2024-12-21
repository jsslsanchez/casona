// /app/api/reservations/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Validate the 'id' parameter
  if (!id) {
    return NextResponse.json({ error: "Reservation id is missing." }, { status: 400 });
  }

  const reservationId = Number(id);

  if (isNaN(reservationId)) {
    return NextResponse.json({ error: "Invalid reservation id." }, { status: 400 });
  }

  try {
    const reservation = await prisma.booking.findUnique({
      where: { id: reservationId },
      include: { guest: true, room: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}