"use client";

import { authService } from "./service";

/** Encerra a sessão no servidor (apaga o cookie) e volta para o login. */
export async function signOutAndRedirect() {
  try {
    await authService.logout();
  } finally {
    window.location.assign("/admin/login");
  }
}
