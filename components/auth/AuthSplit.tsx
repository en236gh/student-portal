import Image from "next/image";
import type { ReactNode } from "react";

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex min-h-[220px] items-center justify-center bg-black lg:min-h-screen">
        <Image
          src="/UNZA.png"
          alt="University of Zambia"
          width={256}
          height={256}
          className="h-40 w-40 object-contain lg:h-64 lg:w-64"
          priority
        />
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
