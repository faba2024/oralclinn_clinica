import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "@/features/users/components/login-view";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
