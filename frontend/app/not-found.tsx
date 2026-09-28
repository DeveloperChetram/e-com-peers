import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      <div className="relative w-full h-full flex-1">
        <Image
          src="/404.jpg"
          alt="404 Not Found"
          fill
          priority
          className="object-contain"
        />
      </div>

      <div className="absolute bottom-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition shadow-lg"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
