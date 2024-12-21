// /components/Loading.tsx

"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7EDE2]">
      <Image
        src="/images/loading-pulse-icon.gif"
        alt="Loading..."
        width={150}
        height={150}
        className="animate-pulse"
      />
    </div>
  );
}