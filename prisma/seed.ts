// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in the correct order to respect foreign key constraints
  await prisma.booking.deleteMany();
  await prisma.roomImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.admin.deleteMany();

  // Hash the passwords before seeding
  const hashedPassword1 = await bcrypt.hash('password1', 10);
  const hashedPassword2 = await bcrypt.hash('password2', 10);

  // Seed admin users
  await prisma.admin.createMany({
    data: [
      {
        email: 'admin1@example.com',
        passwordHash: hashedPassword1,
      },
      {
        email: 'admin2@example.com',
        passwordHash: hashedPassword2,
      },
    ],
  });

  // Seed guests
  const mainGuest = await prisma.guest.create({
    data: {
      identification: 'ID123456',
      documentType: 'Passport',
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      country: 'USA',
      // No hostingGuestId since this is the main guest
    },
  });

  const additionalGuest = await prisma.guest.create({
    data: {
      identification: 'ID654321',
      documentType: 'Citizenship_ID',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'janesmith@example.com',
      phone: '0987654321',
      country: 'Colombia',
      hostingGuestId: mainGuest.identification, // Reference to main guest
    },
  });

  // Seed rooms
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '101',
        roomType: 'Single',
        pricePerNight: 120000,
        capacity: 1,
        size: 20,
        features: 'WiFi,AirConditioning',
        description: 'A cozy single room with all amenities.',
      },
      {
        roomNumber: '102',
        roomType: 'Double',
        pricePerNight: 160000,
        capacity: 2,
        size: 30,
        features: 'WiFi,AirConditioning,SeaView',
        description: 'A spacious double room with a beautiful view.',
      },
    ],
  });

  // Seed room images
  await prisma.roomImage.createMany({
    data: [
      {
        url: '/images/single-room.jpg',
        displayOrder: 1,
        roomNumber: '101', // Adjust to match your room numbers
      },
      {
        url: '/images/double-room-2.jpg',
        displayOrder: 2,
        roomNumber: '101',
      },
      {
        url: '/images/family-room.jpg',
        displayOrder: 1,
        roomNumber: '102',
      },
      // Add more images as needed
    ],
  });

  // Seed bookings
  await prisma.booking.create({
    data: {
      checkIn: new Date('2024-11-01'),
      checkOut: new Date('2024-11-05'),
      status: 'Completed',
      numGuests: 2,
      totalAmount: 480000,
      paymentStatus: 'Paid',
      paymentIntentId: 'pi_1234567890',
      guestId: mainGuest.identification,
      roomNumber: '102',
    },
  });

  // Seed notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'Booking',
        message: 'New reservation made by John Doe',
        status: 'New',
        date: new Date('2024-10-03'),
        details: 'Booking details: Room 102, Check-in on 2024-10-05.',
      },
      {
        type: 'Payment',
        message: 'Payment received for reservation #102',
        status: 'Completed',
        date: new Date('2024-10-02'),
        details: 'Payment of $200 received via credit card.',
      },
      {
        type: 'Cancellation',
        message: 'Reservation #101 was cancelled',
        status: 'Cancelled',
        date: new Date('2024-10-01'),
        details: 'Guest John Doe canceled reservation #101.',
      },
    ],
  });

  console.log('Seed data has been added!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });