import React from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Wrench className="h-6 w-6" />
          <span className="text-xl font-bold">FixItNow</span>
        </Link>
      </div>
      {children}
    </div>
  );
}