"use client";

import { SessionProvider } from "next-auth/react";

interface AuthContextProps {
  children: React.ReactNode;
}

export default function AuthContext({
  children,
}: AuthContextProps): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
