// /app/admin/update-room/[id]/page.tsx

'use client';

import UpdateRoomForm from './UpdateRoomForm';
import { useParams } from 'next/navigation';

export default function UpdateRoomPage() {
  const params = useParams();
  const roomNumber = params?.id as string; // Cast roomNumber to string

  if (!roomNumber) {
    return <p>Invalid room number</p>;
  }

  return <UpdateRoomForm roomNumber={roomNumber} />;
}